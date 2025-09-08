import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupPdfWorker } from './utils/pdf-worker-setup'

// Inicializar el worker de PDF.js
setupPdfWorker().then(success => {
  if (!success) {
    console.warn('La aplicación podría tener problemas al visualizar documentos PDF');
  }

  // Renderizar la aplicación independientemente del resultado
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
