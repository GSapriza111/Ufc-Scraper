import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const parseStrikes = (str) => {
  if (!str || !str.includes('/')) return { landed: 0, thrown: 0 };
  const parts = str.split('/');
  return {
    landed: parseInt(parts[0]) || 0,
    thrown: parseInt(parts[1]) || 0
  };
};

const StatTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const statType = payload[0].dataKey.split('.')[0]; 
    const stats = data[statType];

    return (
      <div style={{ 
        backgroundColor: '#1e1e1e', 
        padding: '6px 10px',  // Reduced padding
        border: '1px solid #444', 
        borderRadius: '4px', 
        color: '#fff', 
        zIndex: 1000,
        fontSize: '11px',     // Smaller base font
        lineHeight: '1.2'     // Tighter text spacing
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '3px', fontSize: '12px' }}>
          Fight {label}: vs. {data.opponent}
        </p>
        <p style={{ margin: '2px 0', color: '#aaa' }}>Thrown: <span style={{color: '#fff'}}>{stats.thrown}</span></p>
        <p style={{ margin: '2px 0', color: '#00ff88' }}>Landed: <span style={{color: '#fff'}}>{stats.landed}</span></p>
      </div>
    );
  }
  return null;
};

const MiniStatChart = ({ title, dataKey, data, color }) => (
  <div style={{ backgroundColor: '#121212', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
    <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#ccc', fontSize: '14px' }}>{title}</h4>
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis dataKey="fightNum" tick={{ fill: '#666', fontSize: 10 }} axisLine={{ stroke: '#444' }} tickLine={false} />
        <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<StatTooltip />} cursor={{ stroke: '#444', strokeWidth: 2 }} />
        <Line type="monotone" dataKey={`${dataKey}.thrown`} stroke={color} strokeWidth={2} dot={{ r: 3, fill: '#121212', strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const RoundStatsDashboard = ({ fightHistory, statsHistory }) => {
  const [selectedRound, setSelectedRound] = useState('1');

  const processedData = fightHistory.map((fight, index) => {
    const stat = statsHistory.find(s => s.fight_id === fight.fight_id && s.rd === selectedRound);

    return {
      fightNum: index + 1,
      opponent: fight.opponent,
      total: parseStrikes(stat?.total_str),
      sig: parseStrikes(stat?.sig_str), // Added Significant Strikes
      head: parseStrikes(stat?.head_str),
      body: parseStrikes(stat?.body_str),
      leg: parseStrikes(stat?.leg_str),
      distance: parseStrikes(stat?.distance_str),
      clinch: parseStrikes(stat?.clinch_str),
      ground: parseStrikes(stat?.ground_str)
    };
  });

  return (
    <div style={{ marginTop: '50px' }}>
      
      {/* Updated Heading and Layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
          Striking Statistics by Round
        </h2>
        <select 
          value={selectedRound} 
          onChange={(e) => setSelectedRound(e.target.value)}
          style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#00ff88', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <option value="1">Round 1</option>
          <option value="2">Round 2</option>
          <option value="3">Round 3</option>
          <option value="4">Round 4</option>
          <option value="5">Round 5</option>
        </select>
      </div>

      {/* Grid structured into exactly 4 columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', // Forces 4 equal columns
        gap: '20px' 
      }}>
        <MiniStatChart title="Total Strikes" dataKey="total" data={processedData} color="#00ff88" />
        <MiniStatChart title="Significant Strikes" dataKey="sig" data={processedData} color="#00e5ff" /> {/* Cyan to match */}
        <MiniStatChart title="Head Strikes" dataKey="head" data={processedData} color="#ff4444" />
        <MiniStatChart title="Body Strikes" dataKey="body" data={processedData} color="#ffbb33" />
        <MiniStatChart title="Leg Strikes" dataKey="leg" data={processedData} color="#33b5e5" />
        <MiniStatChart title="Distance Strikes" dataKey="distance" data={processedData} color="#aa66cc" />
        <MiniStatChart title="Clinch Strikes" dataKey="clinch" data={processedData} color="#ff8800" />
        <MiniStatChart title="Ground Strikes" dataKey="ground" data={processedData} color="#aaaaaa" />
      </div>
    </div>
  );
};

export default RoundStatsDashboard;