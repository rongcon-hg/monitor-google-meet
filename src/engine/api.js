import { useState, useEffect, useCallback } from 'react';

export function useWorkspaceMeetings() {
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

  // Tự động tải dữ liệu mỗi 10 giây
  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 10000);
    return () => clearInterval(interval);
  }, [fetchMeetings]);

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

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/history');
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
