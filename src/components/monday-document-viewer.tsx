import { useState } from 'react';
import { useMondayPdf } from '../connector/use-monday-pdf';
import PdfCanvas from '../components/vistas-pdf/canvas-pdf';
import PdfToolbar from '../components/vistas-pdf/toolbar-pdf';

type Props = {
  itemId: string;
};

export default function MondayDocumentViewer({ itemId }: Props) {
  // Datos del documento desde Monday
  const { meta, blobUrl, loading, err } = useMondayPdf(itemId);
  
  // Estado del visor PDF
  const [scale, setScale] = useState(1.1);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);

  // Funciones de control
  const zoomIn = () => setScale(s => Math.min(s + 0.1, 4));
  const zoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));
  const resetZoom = () => setScale(1.1);
  const prev = () => setPage(p => Math.max(1, p - 1));
  const next = () => setPage(p => Math.min(pages || 1, p + 1));
  
  // Interfaz según el estado
  if (loading) return <div className="p-6">Cargando documento...</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!blobUrl || !meta) return <div className="p-6">No se pudo cargar el documento</div>;
  
  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
      {/* Información del documento */}
      <div className="bg-white p-3 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold">{meta.name}</h2>
        {meta.emails.length > 0 && (
          <div className="text-sm text-gray-500 mt-1">
            <span className="font-medium">Para firmar: </span>
            {meta.emails.join(', ')}
          </div>
        )}
      </div>
      
      {/* Barra de herramientas para navegación y zoom */}
      <PdfToolbar
        page={page}
        pages={pages}
        scale={scale}
        onPrev={prev}
        onNext={next}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />

      {/* Visor del PDF */}
      <PdfCanvas
        fileUrl={blobUrl}
        scale={scale}
        page={page}
        onDocumentLoad={(n) => {
          setPages(n);
          setPage((p) => Math.min(p, n || 1));
        }}
      />
    </div>
  );
}
