export function useAccountSession() {
  return {
    loading: false,
    error: null,
    data: {
      role: 'student',
      provisioned: true,
      blocked: false,
      status: 'active',
      profile: {
        full_name: 'Sajere Stanley',
        contact_email: 'sajere@dean.edu',
        phone: '+371 2000 0000',
        photo_uri: 'mp/private/photo.jpg',
        group_name: 'IR-21A',
        faculty_id: 'fac-governance',
        programme: 'International Relations',
      },
    },
    refresh: () => {},
  };
}