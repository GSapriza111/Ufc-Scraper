import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statOptions = [
    { key: 'sig_str', label: 'Significant Strikes (Landed)' },
    { key: 'total_str', label: 'Total Strikes (Landed)' },
    { key: 'head_str', label: 'Head Strikes (Landed)' },
    { key: 'body_str', label: 'Body Strikes (Landed)' },
    { key: 'leg_str', label: 'Leg Strikes (Landed)' },
    { key: 'distance_str', label: 'Distance Strikes (Landed)' },
    { key: 'clinch_str', label: 'Clinch Strikes (Landed)' },
    { key: 'ground_str', label: 'Ground Strikes (Landed)' },
    { key: 'td', label: 'Takedowns (Landed)' },
    { key: 'kd', label: 'Knockdowns' },
    { key: 'sub', label: 'Submission Attempts' },
    { key: 'rev', label: 'Reversals' },
    { key: 'ctrl', label: 'Control Time (Seconds)' }
];

const SimpleTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dataKey = payload[0].dataKey;
    const value = payload[0].value;
    
    if (!value || value === null) return null;
    
    return (
      <div style={{ 
        backgroundColor: '#1e1e1e', 
        padding: '8px 12px', 
        border: '1px solid #444', 
        borderRadius: '4px', 
        color: '#fff', 
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: payload[0].color }}>
          {data[`${dataKey}_opponent`] || 'N/A'}
        </p>
        <p style={{ margin: '0', color: '#aaa' }}>
          Stat: <span style={{ color: '#fff', fontWeight: 'bold' }}>{value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DetailedCareerStats = ({ fighterName, fightHistory, statsHistory }) => {
  const [selectedStat, setSelectedStat] = useState('sig_str');
  const [isExpanded, setIsExpanded] = useState(true);
  const [hiddenLines, setHiddenLines] = useState({});
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const chartContainerRef = useRef(null);

  // NEW: State variables to track mouse dragging for panning
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const chartData = [1, 2, 3, 4, 5].map(roundNum => {
    const roundStr = roundNum.toString();
    const roundData = { round: roundStr };

    fightHistory.forEach((fight, index) => {
        const stat = statsHistory.find(s => s.fight_id === fight.fight_id && s.rd === roundStr && s.fighter === fighterName);
        let val = null;

        if (stat) {
            if (selectedStat === 'ctrl') {
                if (stat.ctrl && stat.ctrl.includes(':')) {
                    const [m, s] = stat.ctrl.split(':');
                    val = parseInt(m) * 60 + parseInt(s);
                }
            } else if (['kd', 'sub', 'rev'].includes(selectedStat)) {
                val = stat[selectedStat] !== null && stat[selectedStat] !== undefined ? parseInt(stat[selectedStat]) : null;
            } else {
                const raw = stat[selectedStat];
                if (raw && raw.includes('/')) {
                    val = parseInt(raw.split('/')[0]); 
                }
            }
        }
        roundData[`fight_${index}`] = val;
        roundData[`fight_${index}_opponent`] = fight.opponent; // Store opponent name
    });

    return roundData;
  });

  const handleLegendClick = (dataKey) => {
    setHiddenLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); 
      if (e.deltaY < 0) {
        setZoomLevel(prev => Math.min(prev + 0.15, 4)); 
      } else {
        setZoomLevel(prev => Math.max(prev - 0.15, 1)); 
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // NEW: Mouse handlers for click-and-drag panning
  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return; // Only allow dragging if zoomed in
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setScrollLeft(chartContainerRef.current.scrollLeft);
    setScrollTop(chartContainerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const walkX = (e.clientX - startX) * 1.5; // Multiplier adjusts drag speed
    const walkY = (e.clientY - startY) * 1.5;
    chartContainerRef.current.scrollLeft = scrollLeft - walkX;
    chartContainerRef.current.scrollTop = scrollTop - walkY;
  };

  const renderInteractiveLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px', maxHeight: '100px', overflowY: 'auto', padding: '0 10px' }}>
        {payload.map((entry, index) => {
          const isHidden = hiddenLines[entry.dataKey];
          return (
            <div 
              key={`item-${index}`} 
              onClick={() => handleLegendClick(entry.dataKey)}
              style={{ 
                color: isHidden ? '#555' : '#ccc', cursor: 'pointer', fontSize: '12px',
                textDecoration: isHidden ? 'line-through' : 'none', display: 'flex',
                alignItems: 'center', gap: '6px', transition: 'all 0.2s ease'
              }}
              title="Click to toggle visibility"
            >
              <div style={{ width: '12px', height: '12px', backgroundColor: isHidden ? '#555' : entry.color, borderRadius: '2px' }}></div>
              {entry.value}
            </div>
          );
        })}
      </div>
    );
  };

  const btnStyle = {
    backgroundColor: '#ffbb33', color: '#000', border: 'none', borderRadius: '4px',
    padding: '4px 10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
  };

  return (
    <div style={{ marginTop: '50px' }}>
      {/* NEW: CSS block to hide the default scrollbars completely */}
      <style>
        {`
          .no-scrollbars::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbars {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: 'none', border: 'none', color: '#ffbb33', fontSize: '18px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isExpanded ? "Collapse Section" : "Expand Section"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
            Detailed Career Stats
          </h2>
        </div>

        <select 
          value={selectedStat} 
          onChange={(e) => setSelectedStat(e.target.value)}
          style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#ffbb33', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {statOptions.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isExpanded && (
        <div style={{ position: 'relative', backgroundColor: '#121212', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>
          
          <div style={{ position: 'absolute', top: '15px', right: '25px', display: 'flex', gap: '8px', zIndex: 10 }}>
            <button onClick={() => setZoomLevel(1)} style={{...btnStyle, fontSize: '12px', padding: '6px 10px'}}>Reset</button>
            <button onClick={() => setZoomLevel(p => Math.max(p - 0.2, 1))} style={btnStyle}>-</button>
            <button onClick={() => setZoomLevel(p => Math.min(p + 0.2, 4))} style={btnStyle}>+</button>
          </div>

          <div 
            ref={chartContainerRef}
            className="no-scrollbars" // Applied the CSS class here
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ 
              width: '100%', 
              height: '500px', 
              overflow: 'auto', 
              border: zoomLevel > 1 ? '1px dashed #333' : 'none', 
              borderRadius: '8px',
              cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' // Dynamic cursor!
            }}
          >
            <div style={{ width: `${zoomLevel * 100}%`, height: `${zoomLevel * 100}%`, minWidth: '100%', minHeight: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="round" tick={{ fill: '#888', fontSize: 14 }} axisLine={{ stroke: '#444' }} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 14 }} axisLine={false} tickLine={false} />
                  
                  
                  <Legend content={renderInteractiveLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                  
                  {fightHistory.map((fight, index) => {
                    const hue = (index * (360 / fightHistory.length)) % 360;
                    return (
                      <Line 
                        key={index}
                        type="linear" 
                        dataKey={`fight_${index}`} 
                        name={`vs. ${fight.opponent}`} 
                        stroke={`hsl(${hue}, 70%, 55%)`} 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: '#121212', strokeWidth: 2 }} 
                        activeDot={{ r: 7, strokeWidth: 0 }}
                        connectNulls={false}
                        hide={hiddenLines[`fight_${index}`]} 
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {zoomLevel > 1 && (
            <p style={{ textAlign: 'center', color: '#666', fontSize: '12px', margin: '10px 0 0 0', fontStyle: 'italic' }}>
              Scroll to zoom. Click and drag to pan.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedCareerStats;