// Este archivo configura Node.js para ignorar los errores de certificados SSL
// ¡ADVERTENCIA! Esto es inseguro y solo debe usarse en desarrollo local

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
