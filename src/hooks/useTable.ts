'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Table } from '@/types';

export function useTable(tableId: string, pollingInterval?: number) {
  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTable = useCallback(async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Table not found');
          return;
        }
        throw new Error('Failed to fetch');
      }
      const result = await response.json();
      setTable(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchTable();

    if (pollingInterval) {
      const interval = setInterval(fetchTable, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTable, pollingInterval]);

  const updateTable = useCallback(
    async (updates: Partial<Table>) => {
      try {
        const response = await fetch(`/api/tables/${tableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update');
        const result = await response.json();
        setTable(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [tableId]
  );

  return { table, loading, error, updateTable, refetch: fetchTable };
}
