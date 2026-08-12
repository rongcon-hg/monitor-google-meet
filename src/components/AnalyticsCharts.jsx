import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export function AnalyticsCharts({ events = [] }) {
  // Aggregate events per minute
  const chartDataMap = {};
  events.forEach(e => {
    const timeKey = format(new Date(e.time), 'HH:mm');
    if (!chartDataMap[timeKey]) {
      chartDataMap[timeKey] = { time: timeKey, events: 0 };
    }
    chartDataMap[timeKey].events += 1;
  });
  
  const chartData = Object.values(chartDataMap);

  return (
    <div className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title" style={{ marginBottom: '16px' }}>
        <span>Phân Tích & Biểu Đồ Thời Gian Thực</span>
        <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '4px' }}>
          Tần suất hoạt động
        </span>
      </div>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--accent-primary)' }}
              />
              <Line type="monotone" dataKey="events" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-dark)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Chưa đủ dữ liệu biểu đồ
          </div>
        )}
      </div>
    </div>
  );
}
