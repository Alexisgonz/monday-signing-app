// canvas-pdf.tsx
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 1) Carga el worker como worker-URL para Vite:
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker&url";

// 2) Dile a pdf.js dónde está el worker:
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
  fileUrl: string;
  scale: number;
  page: number;
  onDocumentLoad: (numPages: number) => void;
};

export default function PdfCanvas({ fileUrl, scale, page, onDocumentLoad }: Props) {
  return (
    <div className="flex justify-center">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => onDocumentLoad(numPages)}
        loading={<div className="py-8 text-center text-sm text-gray-500">Cargando PDF…</div>}
        onLoadError={(e) => console.error(e)}
      >
        <Page pageNumber={page} scale={scale} renderTextLayer renderAnnotationLayer />
      </Document>
    </div>
  );
}
