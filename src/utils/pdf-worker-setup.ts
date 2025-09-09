// Script para cargar dinámicamente el worker de PDF.js
// Este script se ejecuta al inicio de la aplicación

// Función para detectar si estamos en desarrollo o producción
function isProd() {
  return import.meta.env.PROD === true;
}

// Función para intentar cargar el worker de PDF.js y manejar los posibles errores
export async function setupPdfWorker() {
  try {
    // Importamos pdfjs-dist de forma dinámica
    const pdfjs = await import('pdfjs-dist');
    
    // Configuramos el worker desde CDN (funciona tanto en desarrollo como en producción)
    // Usamos HTTPS explícito para evitar problemas con protocolos relativos
    const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    
    console.info('PDF.js worker cargado correctamente desde:', workerUrl);
    return true;
  } catch (error) {
    console.error('Error al cargar el worker de PDF.js:', error);
    return false;
  }
}

// Opcionalmente, puedes llamar a esta función desde main.tsx 
// para inicializar el worker al principio de la aplicación
