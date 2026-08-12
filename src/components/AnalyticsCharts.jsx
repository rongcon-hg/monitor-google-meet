import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function AnalyticsCharts({ timelineData, participants }) {
  const activeSpeakers = participants.filter(p => p.talkTime > 0);
  
  // Format data for PieChart
  const pieData = activeSpeakers.map(p => ({
    name: p.name,
    value: p.talkTime
  })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5 speakers

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <div className="glass-card animate-fade-in">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Biến động người tham gia</h3>
        <div style={{ height: '200px' }}>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `${val}s`} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="participants" stroke="var(--accent-primary)" strokeWidth={3} dot={false} name="Tổng số người" />
                <Line type="monotone" dataKey="activeSpeakers" stroke="var(--success)" strokeWidth={2} dot={false} name="Người đang nói" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Đang chờ dữ liệu...
            </div>
          )}
        </div>
      </div>

      <div className="glass-card animate-fade-in">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Tỷ lệ phát biểu (Top 5)</h3>
        <div style={{ height: '200px' }}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value) => [`${value}s`, 'Thời gian nói']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Chưa có ai phát biểu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
