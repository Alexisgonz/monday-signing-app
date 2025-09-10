
function isProd() {
  return import.meta.env.PROD === true;
}
export async function setupPdfWorker() {
  try {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    
    console.info('PDF.js worker cargado correctamente desde:', workerUrl);
    return true;
  } catch (error) {
    console.error('Error al cargar el worker de PDF.js:', error);
    return false;
  }
}
