import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getDemoUser } from '@/lib/demoAuth';
import { DEMO_INSTITUTION } from '@/lib/demoInstitutionData';

// Resolves the signed-in account on the server: provisioning, account status
// and the compulsory profile data the account still owes. The whole workspace
// waits for this answer, so a suspended, deactivated or unprovisioned account
// never reaches protected content.
export function useAccountSession() {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const user = getDemoUser();
      const student = DEMO_INSTITUTION.students.find((item) => item.id === user?.id);
      const professor = DEMO_INSTITUTION.professors.find((item) => item.email === user?.email);
      const faculty = DEMO_INSTITUTION.faculties.find((item) => item.id === student?.faculty_id || item.id === professor?.faculty_id);
      setState({
        loading: false,
        error: null,
        data: {
          provisioned: Boolean(user),
          role: user?.role || 'user',
          status: 'active',
          blocked: false,
          missing: [],
          profile_complete: true,
          profile: {
            contact_email: user?.email || '',
            phone: '',
            photo_uri: '',
            faculty_id: faculty?.id || '',
            group_name: student ? `${faculty?.code || 'DEMO'}-${student.year}A` : '',
          },
        },
      });
      return;
    }
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