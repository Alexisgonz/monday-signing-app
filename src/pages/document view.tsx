import { useState } from 'react';
import { usePdfDocument } from '../connector/usePdfDocument';
import { PdfCanvas, PdfToolbar } from '../components/vistas-pdf';

type Props = {
  documentId: string;
};

export default function DocumentPage({ documentId }: Props) {
  const { url, loading, err } = usePdfDocument(documentId);

  const [scale, setScale] = useState(1.1);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);

  const zoomIn = () => setScale((s) => Math.min(4, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
  const resetZoom = () => setScale(1.1);

  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(pages || 1, p + 1));

  if (loading) return <div className="p-6">Cargando documento…</div>;
  if (err)      return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!url)     return <div className="p-6">Sin URL de documento.</div>;

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
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

      <PdfCanvas
        fileUrl={url}
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
