// canvas-pdf.tsx
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configuración para react-pdf@8.0.0 y pdfjs-dist@3.11.174 (versiones compatibles)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

type Props = {
  fileUrl: string;
  scale: number;
  page: number;
  onDocumentLoad: (numPages: number) => void;
};

export default function PdfCanvas({ fileUrl, scale, page, onDocumentLoad }: Props) {
  const [error, setError] = useState<string | null>(null);

  // Maneja errores de forma más explícita
  const handleError = (err: Error) => {
    console.error("Error al cargar el PDF:", err);
    setError(err.message);
  };

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
        <p className="font-bold">Error al cargar el PDF:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => onDocumentLoad(numPages)}
        loading={<div className="py-8 text-center text-sm text-gray-500">Cargando PDF…</div>}
        onLoadError={handleError}
      >
        <Page pageNumber={page} scale={scale} renderTextLayer renderAnnotationLayer />
      </Document>
    </div>
  );
}
