// src/connector/use-monday-pdf.ts
import { useEffect, useState } from 'react';
import { fetchItemMeta } from '../services/monday';
import { sendToSigner as sendToSignerSvc } from '../services/signer.service';

function toProxied(url: string) {
  if (url.startsWith('/proxy-file?u=')) return url;
  return `/proxy-file?u=${encodeURIComponent(url)}`;
}

type ItemMeta = { name: string; emails: string[] };

export function useMondayPdf(itemId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<ItemMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // estado para envío al gestor de firmas
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [processInfo, setProcessInfo] = useState<any>(null);

  // liberar blob al desmontar
  useEffect(() => {
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [url]);

  // cargar metadatos y url
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setUrl(null);

        const m = await fetchItemMeta(itemId);
        if (cancelled) return;

        setMeta({ name: m.name, emails: m.emails });

        if (!m.fileUrl) throw new Error('Este item no tiene PDF');

        const proxied = toProxied(m.fileUrl);
        const absolute = new URL(proxied, window.location.origin).toString();
        setUrl(absolute);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error cargando PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId]);
    async function sendToSigner({ sequential = false }: { sequential?: boolean }) {
    if (!url) throw new Error('No hay URL del documento');
    const emails = meta?.emails ?? [];
    if (!emails.length) throw new Error('No hay correos de firmantes');

    try {
      setSending(true);
      setSendError(null);
      setProcessInfo(null);

      const res = await sendToSignerSvc({
        fileUrl: url,
        filename: `${meta?.name || 'documento'}.pdf`,
        emails,
        sequential,
        mondayId: itemId,
      });

      setProcessInfo(res);
      return res;
    } catch (e: any) {
      setSendError(e?.message || 'Error enviando a firmar');
      throw e;
    } finally {
      setSending(false);
    }
  }

  return { url, meta, loading, err, sending, sendError, processInfo, sendToSigner };
}
