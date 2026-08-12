import React, { useState, useEffect } from 'react';

export function QuickNotes({ meetCode }) {
  const [notes, setNotes] = useState('');

  // Load notes when meetCode changes
  useEffect(() => {
    if (meetCode) {
      const saved = localStorage.getItem(`notes_${meetCode}`);
      if (saved) setNotes(saved);
      else setNotes('');
    }
  }, [meetCode]);

  // Save notes
  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    if (meetCode) {
      localStorage.setItem(`notes_${meetCode}`, val);
    }
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div className="card-title">
        <span style={{ color: '#eab308' }}>Ghi Chú Nhanh Cuộc Họp</span>
        <span style={{ fontSize: '11px', opacity: 0.5 }}>Lưu tự động</span>
      </div>
      <textarea
        className="textarea-notes"
        placeholder="Nhập ghi chú quan trọng, phân công công việc hoặc ý chính..."
        value={notes}
        onChange={handleChange}
      />
    </div>
  );
}
