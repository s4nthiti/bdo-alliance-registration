import { useEffect, useRef, useState, useCallback } from 'react';
import { Registration } from './db';

export function useQuotaUpdates(bossDate: string) {
  const [registrations, setRegistrations] = useState<(Registration & { guild_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pollInterval = 2000; // Poll every 2 seconds

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await fetch(`/api/registrations?bossDate=${encodeURIComponent(bossDate)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      const data = await response.json();
      
      // Check if data has actually changed
      const currentTimestamp = Date.now();
      const dataChanged = JSON.stringify(data) !== JSON.stringify(registrations);
      
      if (dataChanged) {
        setRegistrations(data);
        lastUpdateRef.current = currentTimestamp;
      }
      
      setLoading(false);
      setError(null);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      setError('Failed to load data');
      setIsConnected(false);
      setLoading(false);
    }
  }, [bossDate, registrations]);

  const startPolling = useCallback(() => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial fetch
    fetchRegistrations();

    // Set up polling
    pollingIntervalRef.current = setInterval(() => {
      fetchRegistrations();
    }, pollInterval);

    console.log('Started polling for quota updates');
  }, [fetchRegistrations]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsConnected(false);
    console.log('Stopped polling for quota updates');
  }, []);

  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const reconnect = useCallback(() => {
    setError(null);
    setLoading(true);
    startPolling();
  }, [startPolling]);

  return {
    registrations,
    loading,
    error,
    isConnected,
    reconnect
  };
}
