// src/pages/document-view.tsx
import { useMemo, useState } from "react";
import { useMondayPdf } from "../connector/use-monday-pdf";
import { PdfCanvas } from "../components/vistas-pdf";

type Props = { documentId?: string };

export default function DocumentPage({ documentId }: Props) {
  // ItemId inicial: prop -> env -> fallback
  const initialId = useMemo(
    () => documentId || import.meta.env.VITE_DEFAULT_ITEM_ID || "9233001281",
    [documentId]
  );

  const [itemId, setItemId] = useState<string>(initialId);
  const [scale] = useState(1.25);
  const [, setPages] = useState(0);
  const [sequential, setSequential] = useState(false);

  const {
    url,
    meta,
    loading,
    err,
    sendToSigner,
    sending,
    sendError,
    processInfo,
  } = useMondayPdf(itemId);

  const onEnviar = async () => {
    try {
      await sendToSigner({ sequential });
    } catch {
    }
  };

  if (loading) return <div className="p-6">Cargando…</div>;
  if (err)      return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!url)     return <div className="p-6">Sin URL de documento.</div>;

  return (
    <div className="max-w-5xl p-4 mx-auto space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 px-2 py-1 border rounded"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="Item ID de Monday"
        />
        <button
          className="px-3 py-1 text-white bg-blue-600 rounded"
          onClick={() => setItemId(itemId.trim())}
        >
          Cargar
        </button>
      </div>
      <div className="p-3 bg-white rounded-md shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            {meta?.name ?? `Item ${itemId}`}
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sequential}
              onChange={(e) => setSequential(e.target.checked)}
            />
            Firmas en secuencia
          </label>
        </div>

        <p className="mt-3 text-sm font-medium">Orden de firmantes:</p>
        <ol className="list-decimal list-inside space-y-1">
          {(meta?.emails ?? []).map((email, i) => (
            <li key={i} className="text-sm">{email}</li>
          ))}
          {(!meta?.emails || meta?.emails.length === 0) && (
            <li className="text-sm text-gray-500">Sin correos.</li>
          )}
        </ol>
        <div className="mt-4 flex items-center gap-3">
          <button
            className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-60"
            onClick={onEnviar}
            disabled={sending || !meta?.emails?.length}
            title={!meta?.emails?.length ? 'No hay correos' : 'Enviar a firmar'}
          >
            {sending ? 'Enviando…' : 'Enviar a firmar'}
          </button>

          {sendError && (
            <span className="text-sm text-red-600">Error: {sendError}</span>
          )}
        </div>
        {processInfo && (
          <div className="mt-3 rounded border p-2 bg-gray-50">
            <p className="text-sm font-medium mb-1">Proceso creado:</p>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(processInfo, null, 2)}
            </pre>
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
