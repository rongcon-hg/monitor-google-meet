import { useState, useEffect, useCallback } from 'react';

export function useWorkspaceMeetings(isActive = true) {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API từ Vercel Serverless Function
      const response = await fetch('/api/meetings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success) {
        setMeetings(result.meetings || result.data || []);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || "Lỗi không xác định từ Backend");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu cuộc gọi:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tự động tải dữ liệu và tối ưu Request
  useEffect(() => {
    if (!isActive) return;

    // Tải lần đầu khi component hoặc tab Active
    fetchMeetings();

    // Chỉnh interval lên 30s để tiết kiệm CPU và giới hạn Vercel
    const interval = setInterval(() => {
      // Chỉ gửi request nếu trình duyệt đang mở (không bị thu nhỏ / khác tab)
      if (document.visibilityState === 'visible') {
        fetchMeetings();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMeetings, isActive]);

  return {
    meetings,
    isLoading,
    error,
    lastUpdated,
    fetchMeetings
  };
}

export function useHistoryMeetings() {
  const [historyMeetings, setHistoryMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (dateStr) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = dateStr ? `/api/history?date=${dateStr}` : '/api/history';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success) {
        setHistoryMeetings(result.meetings || result.data || []);
      } else {
        throw new Error(result.error || "Lỗi không xác định từ Backend");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lịch sử:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    historyMeetings,
    isLoading,
    error,
    fetchHistory
  };
}
