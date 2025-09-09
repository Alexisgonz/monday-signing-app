import { useState } from "react";
import { useMondayPdf } from "../connector/use-monday-pdf";
import PdfCanvas from "../components/vistas-pdf/canvas-pdf";

type Props = { itemId: string };

export default function MondayDocumentViewer({ itemId }: Props) {
  const { meta, url, loading, err } = useMondayPdf(itemId);
  const [scale] = useState(1.5);
  const [, setPages] = useState(0);

  if (loading) return <div className="p-6">Cargando documento...</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!url || !meta) return <div className="p-6">No se pudo cargar el documento</div>;

  return (
    <div className="max-w-5xl p-4 mx-auto space-y-4">
      {/* mismo margen para título y correos */}
      <div className="bg-white rounded-md shadow-sm px-16 py-4">
        <h2 className="text-xl font-semibold">{meta.name}</h2>

        {meta.emails.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Para firmar:</p>
            <ul className="mt-1 space-y-1 list-none">
              {meta.emails.map((email, i) => (
                <li key={i} className="text-sm text-gray-700 break-words">
                  {email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <PdfCanvas
        fileUrl={url}
        scale={scale}
        onDocumentLoad={(n) => setPages(n)}
      />
    </div>
  );
}
