import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';

// Upgraded modern tooltip
const FightTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const fight = payload[0].payload;
    return (
      <div style={{ 
        backgroundColor: '#1e1e1e', 
        padding: '10px',      // Reduced padding 
        border: `2px solid ${fight.fillColor}`, 
        borderRadius: '6px',
        color: '#ffffff',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.5)',
        minWidth: '150px',    // Reduced width
        fontSize: '12px'      // Smaller base font
      }}>
        <h4 style={{ margin: '0 0 6px 0', borderBottom: '1px solid #333', paddingBottom: '4px', fontSize: '13px' }}>
          vs. {fight.opponent}
        </h4>
        <p style={{ margin: '4px 0', color: fight.fillColor, fontWeight: 'bold', fontSize: '14px' }}>
          {fight.result}
        </p>
        <p style={{ margin: '3px 0', color: '#aaaaaa' }}>Method: <span style={{color: '#fff'}}>{fight.method}</span></p>
        <p style={{ margin: '3px 0', color: '#aaaaaa' }}>Rounds: <span style={{color: '#fff'}}>{fight.rounds}</span></p>
      </div>
    );
  }
  return null;
};

const FighterHistoryGraph = ({ fighterName, fightHistory }) => {
  const chartData = fightHistory.map((fight, index) => {
    let y_val = 0;
    // Brighter, more modern colors
    let fillColor = '#888888'; 
    let resultLetter = 'D';

    if (fight.result === 'Win') {
      y_val = 1;
      fillColor = '#00ff88'; // Neon Green
      resultLetter = 'W';
    } else if (fight.result === 'Loss') {
      y_val = -1;
      fillColor = '#ff4444'; // Bright Red
      resultLetter = 'L';
    }

    return {
      ...fight,
      x: index + 1, 
      y: y_val,     
      fillColor: fillColor,
      resultLetter: resultLetter,
      size: 400 // Controls the dot size
    };
  });

  const formatYAxis = (tickItem) => {
    if (tickItem === 1) return 'WIN';
    if (tickItem === 0) return 'DRAW';
    if (tickItem === -1) return 'LOSS';
    return '';
  };

  return (
    <div style={{ 
        width: '100%', 
        height: 450, 
        backgroundColor: '#121212', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0px 10px 30px rgba(0,0,0,0.8)',
        color: '#ffffff'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {fighterName} <span style={{color: '#888', fontSize: '16px'}}>| Career Trajectory</span>
      </h2>
      
      <ResponsiveContainer width="100%" height="85%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          {/* Subtle grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
          
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Fight" 
            tick={{fontSize: 12, fill: '#888'}} 
            axisLine={{ stroke: '#555' }}
            tickLine={false}
          />
          
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Result" 
            tickFormatter={formatYAxis} 
            domain={[-1.5, 1.5]} 
            ticks={[-1, 0, 1]} 
            tick={{fontSize: 14, fontWeight: 'bold', fill: '#fff'}}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          {/* ZAxis controls the size of the scatter dots */}
          <ZAxis type="number" dataKey="size" range={[200, 600]} />
          
          <Tooltip 
            content={<FightTooltip />} 
            cursor={{ strokeDasharray: '3 3', stroke: '#666', strokeWidth: 2 }} 
          />
          
          <Scatter name="Fights" data={chartData} shape="circle">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fillColor} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FighterHistoryGraph;