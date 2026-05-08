import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, PieChart, Pie, Legend } from 'recharts';

// Upgraded modern tooltip for the scatter chart
const FightTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const fight = payload[0].payload;
    return (
      <div style={{ 
        backgroundColor: '#1e1e1e', 
        padding: '10px', 
        border: `2px solid ${fight.fillColor}`, 
        borderRadius: '6px',
        color: '#ffffff',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.5)',
        minWidth: '150px',
        fontSize: '12px'
      }}>
        <h4 style={{ margin: '0 0 6px 0', borderBottom: '1px solid #333', paddingBottom: '4px', fontSize: '13px' }}>
          vs. {fight.opponent}
        </h4>
        <p style={{ margin: '4px 0', color: fight.fillColor, fontWeight: 'bold', fontSize: '14px' }}>
          {fight.result}
        </p>
        <p style={{ margin: '3px 0', color: '#aaaaaa' }}>Method: <span style={{color: '#fff'}}>{fight.method}</span></p>
        <p style={{ margin: '3px 0', color: '#aaaaaa' }}>Rounds: <span style={{color: '#fff'}}>{fight.rounds}</span></p>
        <p style={{ margin: '3px 0', color: '#aaaaaa' }}>Date: <span style={{color: '#fff'}}>{fight.fightDate ? new Date(fight.fightDate).toLocaleDateString() : 'N/A'}</span></p>
      </div>
    );
  }
  return null;
};

// Custom Pie Tooltip for the 3 pie charts
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#1e1e1e', padding: '10px', border: '1px solid #444', borderRadius: '4px', color: '#fff', fontSize: '12px', zIndex: 1000 }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
        <p style={{ margin: '5px 0 0 0', color: '#aaa' }}>Count: <span style={{color: '#fff'}}>{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

const FighterHistoryGraph = ({ fighterName, fightHistory }) => {
  // 1. Process data for the Scatter Chart
  const chartData = fightHistory.map((fight, index) => {
    let y_val = 0;
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
      size: 400 
    };
  });

  const formatYAxis = (tickItem) => {
    if (tickItem === 1) return 'WIN';
    if (tickItem === 0) return 'DRAW';
    if (tickItem === -1) return 'LOSS';
    return '';
  };

  // 2. Process data for the Pie Charts
  let wins = 0, losses = 0, draws = 0;
  const winMethods = {};
  const lossMethods = {};

  fightHistory.forEach(fight => {
    if (fight.result === 'Win') {
      wins++;
      winMethods[fight.method] = (winMethods[fight.method] || 0) + 1;
    } else if (fight.result === 'Loss') {
      losses++;
      lossMethods[fight.method] = (lossMethods[fight.method] || 0) + 1;
    } else {
      draws++;
    }
  });

  const recordData = [
    { name: 'Wins', value: wins, fillColor: '#00ff88' },
    { name: 'Losses', value: losses, fillColor: '#ff4444' },
    { name: 'Draws/NC', value: draws, fillColor: '#888888' }
  ].filter(d => d.value > 0); // Don't render slices that are 0

  // Palette to cleanly color the different method slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#aa66cc', '#33b5e5', '#ff4444', '#00ff88'];

  const formatMethodData = (methodsObj) => {
     return Object.keys(methodsObj).map((key, index) => ({
        name: key,
        value: methodsObj[key],
        fill: COLORS[index % COLORS.length]
     }));
  };

  const winMethodData = formatMethodData(winMethods);
  const lossMethodData = formatMethodData(lossMethods);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Row: Trajectory (Scatter) & Record (Pie) */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Career Trajectory Graph */}
        <div style={{ 
            flex: '2 1 600px', 
            height: 450, 
            backgroundColor: '#121212', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.8)',
            color: '#ffffff'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {fighterName} <span style={{color: '#888', fontSize: '16px'}}>| Career Overview</span>
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
              <XAxis type="number" dataKey="x" name="Fight" tick={{fontSize: 12, fill: '#888'}} axisLine={{ stroke: '#555' }} tickLine={false} />
              <YAxis type="number" dataKey="y" name="Result" tickFormatter={formatYAxis} domain={[-1.5, 1.5]} ticks={[-1, 0, 1]} tick={{fontSize: 14, fontWeight: 'bold', fill: '#fff'}} axisLine={false} tickLine={false} width={60} />
              <ZAxis type="number" dataKey="size" range={[200, 600]} />
              <Tooltip content={<FightTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666', strokeWidth: 2 }} />
              <Scatter name="Fights" data={chartData} shape="circle">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fillColor} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Record Overview Pie Chart */}
        <div style={{ 
            flex: '1 1 300px',
            height: 450, 
            backgroundColor: '#121212', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.8)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '20px' }}>
            Career Record
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={recordData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {recordData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fillColor} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Methods of Victory & Methods of Defeat */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Victory Methods Pie */}
        <div style={{ 
            flex: '1 1 300px',
            height: 350, 
            backgroundColor: '#121212', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.8)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '18px' }}>
            Methods of Victory
          </h2>
          {winMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={winMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {winMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <p style={{ textAlign: 'center', color: '#888', marginTop: 'auto', marginBottom: 'auto' }}>No wins recorded.</p>
          )}
        </div>

        {/* Loss Methods Pie */}
        <div style={{ 
            flex: '1 1 300px',
            height: 350, 
            backgroundColor: '#121212', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.8)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '18px' }}>
            Methods of Loss
          </h2>
          {lossMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={lossMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {lossMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <p style={{ textAlign: 'center', color: '#888', marginTop: 'auto', marginBottom: 'auto' }}>No losses recorded.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default FighterHistoryGraph;