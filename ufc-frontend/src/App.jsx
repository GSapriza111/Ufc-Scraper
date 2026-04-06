import React, { useState } from 'react';
import FighterHistoryGraph from './FighterHistoryGraph';
import RoundStatsDashboard from './RoundStatsDashboard'; // Import the new component

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fighterName, setFighterName] = useState('');
  const [dbData, setDbData] = useState(null); // Changed to hold the full backend object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3000/api/fighter/${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      if (data.fightHistory.length === 0) {
        setError('No fights found for this fighter.');
        setDbData(null);
      } else {
        setDbData(data); // Store both fightHistory and statsHistory
        setFighterName(searchQuery);
      }
    } catch (err) {
      setError('An error occurred while fetching the fighter.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>UFC Stats Dashboard</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <input 
            type="text" 
            placeholder="Enter fighter name (e.g. Jon Jones)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '4px 0 0 4px', border: 'none', width: '300px', outline: 'none' }}
          />
          <button 
            type="submit" 
            style={{ padding: '12px 20px', fontSize: '16px', backgroundColor: '#00ff88', color: '#000', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Checking database and scraping if necessary...</p>}

        {!loading && dbData && (
          <>
            <FighterHistoryGraph 
              fighterName={fighterName} 
              fightHistory={dbData.fightHistory} 
            />
            {/* The new dashboard drops in right here */}
            <RoundStatsDashboard 
              fightHistory={dbData.fightHistory}
              statsHistory={dbData.statsHistory}
            />
          </>
        )}

      </div>
    </div>
  );
}

export default App;