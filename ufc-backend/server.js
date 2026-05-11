import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { spawn } from 'child_process';
import path from 'path';
import dbConfig from './dbconfig.js';

const app = express();
app.use(cors());

// MySQL Connection details

// The path to where your python scripts live
const PYTHON_DIR = path.resolve('../'); 

// Helper function to run the Python scraper
const runScraper = (fighterName) => {
    return new Promise((resolve, reject) => {
        const pyProg = spawn('python', ['db_manager.py'], { cwd: PYTHON_DIR });

        // Your python scripts ask for input() twice. We programmatically write to them here!
        pyProg.stdin.write(`${fighterName}\n`); // Answers ufc_scraper.py
        pyProg.stdin.write(`${fighterName}\n`); // Answers db_manager.py
        pyProg.stdin.end();

        pyProg.stdout.on('data', (data) => console.log(`Python: ${data.toString().trim()}`));
        pyProg.stderr.on('data', (data) => console.error(`Python Error: ${data.toString()}`));

        pyProg.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error('Python script failed'));
        });
    });
};

app.get('/api/fighter/:name', async (req, res) => {
    const fighterName = req.params.name;
    console.log(`Searching for: ${fighterName}`);

    try {
        const connection = await mysql.createConnection(dbConfig);

        // 1. Check if the fighter exists in the DB
        const [fighterRows] = await connection.execute(
            'SELECT * FROM fighter WHERE fighter_name = ?', 
            [fighterName]
        );

        const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        let scraped = false;
        if (fighterRows.length === 0) {
            console.log('Fighter not found in DB. Triggering Python Scraper...');
            await runScraper(fighterName);
            scraped = true;
            console.log('Scraping complete. Fetching new data...');
        } else if (!fighterRows[0].searched) {
            console.log('Fighter found but not fully searched. Triggering Python Scraper for missing data...');
            await runScraper(fighterName);
            scraped = true;
            console.log('Additional scraping complete. Fetching new data...');
        } else if (fighterRows[0].updated_at == new Date()- 7){
            await runScraper(fighterName);
            scraped = true;
            console.log('Updated figher: ' + fighterName);
        }

        // Update searched status if we scraped
        if (scraped) {
            await connection.execute(
                'UPDATE fighter SET searched = true WHERE fighter_name = ?',
                [fighterName]
            );
        }

        // 3. Retrieve all fights involving this fighter
        const [fightRows] = await connection.execute(`
            SELECT * FROM fight 
            WHERE fighter1 = ? OR fighter2 = ? 
            ORDER BY fightDate ASC  -- Changed from fight_id ASC to fightDate ASC
        `, [fighterName, fighterName]);

        // 4. Retrieve all stats for this fighter
        const [statRows] = await connection.execute(`
            SELECT * FROM stats 
            WHERE fight_id IN (
                SELECT fight_id FROM fight WHERE fighter1 = ? OR fighter2 = ?
            )
        `, [fighterName, fighterName]);

        // 5. Format the overview data
        const chartData = fightRows.map(f => {
            const opponent = f.fighter1 === fighterName ? f.fighter2 : f.fighter1;
            
            let result = 'Draw/NC';
            if (f.winner === fighterName) result = 'Win';
            else if (f.winner === opponent) result = 'Loss';

            return {
                fight_id: f.fight_id, // Added so React can match the stats!
                opponent: opponent,
                result: result,
                method: f.method,
                rounds: f.end_round,
                fightDate: f.fightDate
            };
        }) 

        await connection.end();
        
        // Return both arrays in one object
        res.json({
            fightHistory: chartData,
            statsHistory: statRows
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to retrieve fighter data' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));