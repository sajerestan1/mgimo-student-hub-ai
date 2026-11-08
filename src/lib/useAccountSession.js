import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Resolves the signed-in account on the server: provisioning, account status
// and the compulsory profile data the account still owes. The whole workspace
// waits for this answer, so a suspended, deactivated or unprovisioned account
// never reaches protected content.
export function useAccountSession() {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await base44.functions.invoke('accountSession', {});
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      setState({ loading: false, data, error: null });
    } catch (error) {
      setState({ loading: false, data: null, error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}