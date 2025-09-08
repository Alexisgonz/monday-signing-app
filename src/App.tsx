import { useState, useEffect } from 'react';
import MondayDocumentViewer from './components/monday-document-viewer';

export default function App() {
  // Obtener el itemId de la URL o usar el valor por defecto
  const [itemId, setItemId] = useState(() => {
    // Intentar leer de la URL (parámetro ?itemId=1234)
    const params = new URLSearchParams(window.location.search);
    return params.get('itemId') || '9233001281';
  });

  // Actualizar la URL cuando cambia el itemId (sin recargar la página)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('itemId', itemId);
    window.history.pushState({}, '', url);
  }, [itemId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 border-b bg-white flex justify-between items-center">
        <h1 className="text-lg font-semibold">Visor de Documento</h1>
        
        {/* Control para cambiar de documento */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="ID del item en Monday"
            className="border rounded px-2 py-1 w-52 text-sm"
          />
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Cargar
          </button>
        </div>
      </header>

      <MondayDocumentViewer itemId={itemId} />
    </div>
  );
}