import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
  console.log("PDF worker configurado globalmente");
}

type Props = {
  fileUrl: string;
  scale: number;
  page?: number;
  onDocumentLoad: (numPages: number) => void;
};

export default function PdfCanvas({ fileUrl, scale, page, onDocumentLoad }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  useEffect(() => {
    if (!fileUrl) {
      setError("No se proporcionó una URL de archivo");
    }
  }, [fileUrl]);

  const handleError = (err: Error) => {
    console.error("Error al cargar el PDF:", err);
    setError(err.message);
  };

  if (error) {
    return (
      <div className="p-4 text-red-700 border border-red-300 rounded bg-red-50">
        <p className="font-bold">Error al cargar el PDF:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-md shadow-sm">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          onDocumentLoad(numPages);
        }}
        loading={<div className="py-8 text-sm text-center text-gray-500">Cargando PDF…</div>}
        onLoadError={handleError}
      >
        {page ? (
          <Page 
            pageNumber={page} 
            scale={scale} 
            renderTextLayer 
            renderAnnotationLayer 
            className="mb-8 shadow-sm"
          />
        ) : (
          Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
              className="mb-8 shadow-sm"
            />
          ))
        )}
      </Document>
    </div>
  );
}
