import React from 'react';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';

export function ChatLog({ chatMessages }) {
  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} color="var(--accent-primary)" />
        Tin nhắn trong cuộc gọi
      </h3>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
        {chatMessages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{msg.sender}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{format(msg.time, 'HH:mm')}</span>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '8px 12px', 
              borderRadius: '0 12px 12px 12px', 
              fontSize: '14px',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {chatMessages.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            Chưa có tin nhắn nào.
          </div>
        )}
      </div>
    </div>
  );
}
