export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_SIGNER_API_URL || '',

  endpoints: {
    createProcess: '/signer/signatures/create/',
    configureFields: (processId: string) => `/signer/signatures/${processId}/configure_fields/`,
    saveSignature: (assignmentToken: string) => `/signer/signatures/${assignmentToken}/save_signature/`,
  },
  
  version: '1.0',
  timeouts: {
    default: 30000,
    upload: 60000,
  }
};
