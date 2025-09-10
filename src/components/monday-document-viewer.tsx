// src/pages/monday-document-viewer.tsx
import { useState } from "react";
import { useMondayPdf } from "../connector/use-monday-pdf";
import PdfCanvas from "../components/vistas-pdf/canvas-pdf";
import { openAssignView } from "../services/signer.service";

type Props = { itemId: string };

export default function MondayDocumentViewer({ itemId }: Props) {
  const {
    meta,
    url,
    loading,
    err,
    sending,
    sendError,
    processInfo,
    sendToSigner,
  } = useMondayPdf(itemId);

  const [scale] = useState(1.5);
  const [, setPages] = useState(0);
  const [sequential, setSequential] = useState(false);

  const [showProcessManager, setShowProcessManager] = useState(false);
  const [currentProcessUuid, setCurrentProcessUuid] = useState<string | null>(
    null
  );

  if (loading) return <div className="p-6">Cargando documento…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!url || !meta)
    return <div className="p-6">No se pudo cargar el documento.</div>;

  const handleSendToSigner = async () => {
    const emails = meta.emails ?? [];
    if (!emails.length) {
      alert("No hay correos de firmantes configurados en Monday.com.");
      return;
    }

    try {
      const result = await sendToSigner({ sequential });

      // Esperamos un objeto con uuid. Si no viene, informamos:
      if (result && typeof result === "object" && result.uuid) {
        setCurrentProcessUuid(result.uuid);
        setShowProcessManager(true);

        // Abre la vista de asignación en Django usando el proxy /signer
        // (evitas CORS y no hardcodeas 127.0.0.1)
        openAssignView(result.uuid, true);
      } else {
        const dump =
          typeof result === "string"
            ? result
            : JSON.stringify(result ?? {}, null, 2);
        alert(
          `La API no devolvió un UUID del proceso.\n\nRespuesta recibida:\n${dump}`
        );
      }
    } catch (e: any) {
      alert(`Error enviando documento a firmar:\n\n${e?.message || e}`);
    }
  };

  return (
    <div className="max-w-5xl p-4 mx-auto space-y-4">
      {/* Encabezado con info y controles */}
      <div className="px-6 py-4 bg-white rounded-md shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{meta.name}</h2>

            {(meta.emails?.length ?? 0) > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Para firmar:</p>
                <ul className="mt-1 space-y-1 list-none">
                  {meta.emails!.map((email, i) => (
                    <li key={i} className="text-sm text-gray-700 break-words">
                      {email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Controles de envío */}
          <div className="w-64 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <input
                id="sequential"
                type="checkbox"
                checked={sequential}
                onChange={(e) => setSequential(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sequential" className="text-sm">
                Firmas secuenciales
              </label>
            </div>

            <button
              onClick={handleSendToSigner}
              disabled={sending || !meta.emails?.length}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Enviando…" : "Enviar y configurar firmas"}
            </button>

            <p className="mt-1 text-xs text-center text-gray-500">
              Se abrirá la vista de configuración en una nueva pestaña
            </p>
          </div>
        </div>

        {/* Mensajería de envío */}
        {sendError && (
          <div className="p-3 mt-3 text-sm text-red-700 border border-red-200 rounded bg-red-50">
            <p className="font-medium">Error al enviar:</p>
            <p>{sendError}</p>
          </div>
        )}

        {processInfo?.uuid && (
          <div className="p-3 mt-3 text-sm text-green-700 border border-green-200 rounded bg-green-50">
            <p className="font-medium">Proceso creado exitosamente</p>
            <p>UUID: {processInfo.uuid}</p>
            {processInfo.assignments?.length ? (
              <p>Firmantes creados: {processInfo.assignments.length}</p>
            ) : null}
          </div>
        )}
      </div>

      {/* Visor PDF */}
      <PdfCanvas
        fileUrl={url}
        scale={scale}
        onDocumentLoad={(n) => setPages(n)}
      />
    </div>
  );
}
