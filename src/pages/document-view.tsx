import { useState } from "react";
import { useMondayPdf } from "../connector/use-monday-pdf";
import { PdfCanvas } from "../components/vistas-pdf";
import { sendToSigner } from "../services/signer.service";

type Props = { documentId?: string };

export default function DocumentPage({ documentId }: Props) {
  const [itemId, setItemId] = useState(documentId || "9233001281");
  const { url, meta, loading, err } = useMondayPdf(itemId);
  const [sending, setSending] = useState(false);
  const [scale] = useState(1.5);
  const [, setPages] = useState(0);

  const onSend = async () => {
    if (!url) return;
    const emails = meta?.emails ?? [];
    if (!emails.length) {
      alert("No hay correos de firmantes configurados.");
      return;
    }
    try {
      setSending(true);
      const res = await sendToSigner({
        fileUrl: url,
        filename: `${meta?.name || "documento"}.pdf`,
        emails,
        sequential: false,
      });
      const token = res.assignments?.[0]?.access_token;
      if (token) {
        window.open(`/signer/signatures/${token}/signature_page/`, "_blank");
      } else if (res.uuid) {
        window.open(`/signer/signatures/${res.uuid}/signature_page/`, "_blank");
      } else {
        alert("Proceso creado, pero no recibí token/uuid para abrir la página de firma.");
        console.log("Respuesta del backend:", res);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error enviando a firmar");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-6">Cargando…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!url) return <div className="p-6">Sin URL de documento.</div>;

  return (
    <div className="max-w-5xl p-4 mx-auto space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 px-2 py-1 border rounded"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
        />
        <button
          className="px-3 py-1 text-white bg-blue-600 rounded"
          onClick={() => setItemId(itemId.trim())}
        >
          Cargar
        </button>
      </div>

      <div className="p-3 bg-white rounded-md shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {meta?.name ?? `Item ${itemId}`}
            </h2>
            <p className="mt-2 text-sm font-medium">Orden de firmantes:</p>
            <ol className="list-decimal list-inside">
              {(meta?.emails ?? []).map((email, i) => (
                <li key={i}>{email}</li>
              ))}
              {(!meta?.emails || meta?.emails.length === 0) && (
                <li className="text-gray-500">Sin correos.</li>
              )}
            </ol>
          </div>

          <button
            className="h-10 px-4 py-2 text-white rounded bg-emerald-600 disabled:opacity-60"
            onClick={onSend}
            disabled={sending || !meta?.emails?.length}
            title={!meta?.emails?.length ? "No hay firmantes" : "Enviar a firmar"}
          >
            {sending ? "Enviando…" : "Enviar a firmar"}
          </button>
        </div>
      </div>

      <PdfCanvas
        fileUrl={url}
        scale={scale}
        onDocumentLoad={(n) => setPages(n)}
      />
    </div>
  );
}
