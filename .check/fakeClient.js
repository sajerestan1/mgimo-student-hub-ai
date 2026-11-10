const page = () => ({ items: [], next_cursor: null, has_more: false });

const entity = () => ({
  list: async (opts) => (opts && typeof opts === 'object' && !Array.isArray(opts) ? page() : []),
  filter: async () => page(),
  count: async () => 0,
  aggregate: async () => ({ rows: [] }),
  distinct: async () => ({ items: [] }),
  get: async () => null,
  create: async (d) => d,
  bulkCreate: async (d) => d,
  bulkUpdate: async (d) => d,
  update: async (id, d) => d,
  updateMany: async () => ({ updated: 0 }),
  delete: async () => ({}),
  deleteMany: async () => ({ deleted: 0 }),
  subscribe: () => () => {},
});

const entities = new Proxy({}, { get: () => entity() });

const currentUser = () => (global.__SESSION__ || {}).user || null;

export const base44 = {
  entities,
  auth: {
    me: async () => currentUser(),
    isAuthenticated: async () => Boolean(currentUser()),
    updateMe: async (d) => d,
    logout: async () => {},
    redirectToLogin: () => {},
  },
  functions: { invoke: async () => ({ data: {} }) },
  integrations: {
    Core: {
      InvokeLLM: async () => '',
      UploadPrivateFile: async () => ({ file_uri: '' }),
      UploadPublicFile: async () => ({ file_url: '' }),
      SendEmail: async () => ({ success: true }),
    },
  },
  analytics: { track: () => {} },
  users: { inviteUser: async () => ({}) },
  app: { getPublicSettings: async () => ({ id: 'test', public_settings: {} }) },
};

export default { base44 };