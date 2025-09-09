// src/config/api-config.ts

/**
 * Configuración para la API de firma
 */
export const API_CONFIG = {
  // URL base de la API de firma (configurable desde variables de entorno)
  baseUrl: import.meta.env.VITE_SIGNER_API_URL || '',
  
  // Endpoints
  endpoints: {
    createProcess: '/signer/signatures/create/',
    configureFields: (processId: string) => `/signer/signatures/${processId}/configure_fields/`,
    saveSignature: (assignmentToken: string) => `/signer/signatures/${assignmentToken}/save_signature/`,
  },
  
  // Versiones de API
  version: '1.0',
  
  // Timeouts (en ms)
  timeouts: {
    default: 30000, // 30 segundos
    upload: 60000,  // 60 segundos para subidas de archivos
  }
};
