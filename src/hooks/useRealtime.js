import { useState, useEffect, useCallback } from 'react';
import { fetchAllLeaves, fetchPrincipalDashboard } from '../services/apiService.js';

export function useRealtime(user, socketEvent) {
  const [leaves, setLeaves] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    if (user.role === 'Principal') {
      const dash = await fetchPrincipalDashboard();
      if (dash) setDashboardData(dash);
      const all = await fetchAllLeaves();
      if (Array.isArray(all)) setLeaves(all);
    } else {
      const data = await fetchAllLeaves();
      if (Array.isArray(data)) setLeaves(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle incoming real-time socket events
  useEffect(() => {
    if (!socketEvent || !socketEvent.event) return;

    const { event, data } = socketEvent;

    if (!data || !data.leaveId) {
      if (user?.role === 'Principal') {
        fetchPrincipalDashboard().then(dash => dash && setDashboardData(dash));
      }
      return;
    }

    setLeaves(prev => {
      const index = prev.findIndex(l => l.leaveId === data.leaveId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data };
        return updated;
      } else {
        return [data, ...prev];
      }
    });

    if (user?.role === 'Principal') {
      fetchPrincipalDashboard().then(dash => dash && setDashboardData(dash));
    }
  }, [socketEvent, user]);

  return { leaves, setLeaves, dashboardData, loading, refreshData: loadData };
}
