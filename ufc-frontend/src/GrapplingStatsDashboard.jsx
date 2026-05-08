import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const parseStrikes = (str) => {
  if (!str || !str.includes('/')) return { landed: null, thrown: null };
  const parts = str.split('/');
  return { landed: parseInt(parts[0]) || 0, thrown: parseInt(parts[1]) || 0 };
};

const parseTime = (str) => {
  if (!str || !str.includes(':')) return { seconds: null, display: 'N/A' };
  const parts = str.split(':');
  return { seconds: (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0), display: str };
};

const GrapplingTooltip = ({ active, payload, label, type }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let content = null;

    if (data.takedowns.thrown === null) {
      content = <p style={{ margin: '4px 0', color: '#aaa', fontStyle: 'italic' }}>Fight ended before this round.</p>;
    } else {
      if (type === 'td') {
          content = (
              <>
                  <p style={{ margin: '2px 0', color: '#aaa' }}>Attempted: <span style={{color: '#fff'}}>{data.takedowns.thrown}</span></p>
                  <p style={{ margin: '2px 0', color: '#00ff88' }}>Landed: <span style={{color: '#fff'}}>{data.takedowns.landed}</span></p>
              </>
          );
      } else if (type === 'tdDef') {
          content = (
              <>
                  <p style={{ margin: '2px 0', color: '#aaa' }}>Faced: <span style={{color: '#fff'}}>{data.tdDefense.faced}</span></p>
                  <p style={{ margin: '2px 0', color: '#ff4444' }}>Defended: <span style={{color: '#fff'}}>{data.tdDefense.defended}</span></p>
              </>
          );
      } else if (type === 'ctrl') {
          content = <p style={{ margin: '2px 0', color: '#33b5e5' }}>Control Time: <span style={{color: '#fff'}}>{data.control.display}</span></p>;
      } else if (type === 'sub') {
          content = <p style={{ margin: '2px 0', color: '#aa66cc' }}>Sub Attempts: <span style={{color: '#fff'}}>{data.submissions}</span></p>;
      } else if (type === 'rev') {
          content = <p style={{ margin: '2px 0', color: '#ffbb33' }}>Reversals: <span style={{color: '#fff'}}>{data.reversals}</span></p>;
      }
    }

    return (
      <div style={{ backgroundColor: '#1e1e1e', padding: '6px 10px', border: '1px solid #444', borderRadius: '4px', color: '#fff', zIndex: 1000, fontSize: '11px', lineHeight: '1.2' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '3px', fontSize: '12px' }}>
          Fight {label}: vs. {data.opponent}
        </p>
        {content}
      </div>
    );
  }
  return null;
};

const GrapplingChart = ({ title, dataKey, data, color, type }) => (
  <div style={{ backgroundColor: '#121212', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
    <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#ccc', fontSize: '14px' }}>{title}</h4>
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis dataKey="fightNum" tick={{ fill: '#666', fontSize: 10 }} axisLine={{ stroke: '#444' }} tickLine={false} />
        <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<GrapplingTooltip type={type} />} cursor={{ stroke: '#444', strokeWidth: 2 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: '#121212', strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls={true} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const GrapplingStatsDashboard = ({ fighterName, fightHistory, statsHistory }) => {
  const [selectedRound, setSelectedRound] = useState('1');
  const [isExpanded, setIsExpanded] = useState(true);

  const processedData = fightHistory.map((fight, index) => {
    const fStat = statsHistory.find(s => s.fight_id === fight.fight_id && s.rd === selectedRound && s.fighter === fighterName);
    const oStat = statsHistory.find(s => s.fight_id === fight.fight_id && s.rd === selectedRound && s.fighter === fight.opponent);

    const td = parseStrikes(fStat?.td);
    const oppTd = parseStrikes(oStat?.td);

    return {
      fightNum: index + 1,
      opponent: fight.opponent,
      takedowns: td,
      tdDefense: {
        faced: oppTd.thrown,
        defended: oppTd.thrown !== null ? oppTd.thrown - oppTd.landed : null
      },
      control: parseTime(fStat?.ctrl),
      submissions: fStat ? parseInt(fStat.sub || 0) : null,
      reversals: fStat ? parseInt(fStat.rev || 0) : null
    };
  });

  return (
    <div style={{ marginTop: '50px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
              background: 'none', border: 'none', color: '#33b5e5', fontSize: '18px', 
              cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title={isExpanded ? "Collapse Section" : "Expand Section"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
            Grappling Statistics by Round
          </h2>
        </div>

        <select 
          value={selectedRound} 
          onChange={(e) => setSelectedRound(e.target.value)}
          style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#33b5e5', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <option value="1">Round 1</option>
          <option value="2">Round 2</option>
          <option value="3">Round 3</option>
          <option value="4">Round 4</option>
          <option value="5">Round 5</option>
        </select>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <GrapplingChart title="Takedowns" dataKey="takedowns.thrown" data={processedData} color="#00ff88" type="td" />
            <GrapplingChart title="Takedown Defense" dataKey="tdDefense.faced" data={processedData} color="#ff4444" type="tdDef" />
            <GrapplingChart title="Control Time" dataKey="control.seconds" data={processedData} color="#33b5e5" type="ctrl" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <GrapplingChart title="Submission Attempts" dataKey="submissions" data={processedData} color="#aa66cc" type="sub" />
            <GrapplingChart title="Reversals" dataKey="reversals" data={processedData} color="#ffbb33" type="rev" />
          </div>
        </div>
      )}
      
    </div>
  );
};

export default GrapplingStatsDashboard;