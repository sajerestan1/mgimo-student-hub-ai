export function useAccountSession() {
  const user = (global.__SESSION__ || {}).user || {};
  return {
    loading: false,
    error: null,
    refresh: () => {},
    data: {
      provisioned: true,
      blocked: false,
      status: 'active',
      role: user.role || 'student',
      profile: {
        phone: '+10000000000',
        contact_email: user.email || 'account@digitaldean.edu',
        photo_uri: 'profile.png',
        faculty_id: 'faculty-1',
        group_name: 'IR-21A',
      },
    },
  };
}