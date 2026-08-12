import React from 'react';
import { format } from 'date-fns';
import { LogIn, LogOut, Mic, MicOff, MonitorUp, Hand } from 'lucide-react';

export function AuditLog({ logs }) {
  const getIcon = (type) => {
    switch(type) {
      case 'join': return <LogIn size={14} color="var(--success)" />;
      case 'leave': return <LogOut size={14} color="var(--danger)" />;
      case 'speak': return <Mic size={14} color="var(--accent-primary)" />;
      case 'mute': return <MicOff size={14} color="var(--text-secondary)" />;
      case 'share': return <MonitorUp size={14} color="var(--accent-secondary)" />;
      case 'hand': return <Hand size={14} color="var(--warning)" />;
      default: return <div style={{width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)'}} />;
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Nhật ký sự kiện (Timeline Audit Log)</h3>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
        {logs.map(log => (
          <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '13px' }}>
            <div style={{ color: 'var(--text-secondary)', minWidth: '60px', paddingTop: '2px' }}>
              {format(log.time, 'HH:mm:ss')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
              {getIcon(log.type)}
            </div>
            <div style={{ color: log.type === 'system' ? 'var(--text-secondary)' : 'var(--text-primary)', flex: 1, fontStyle: log.type === 'system' ? 'italic' : 'normal' }}>
              {log.message}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            Chưa có sự kiện nào được ghi nhận.
          </div>
        )}
      </div>
    </div>
  );
}
