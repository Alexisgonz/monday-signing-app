import { useEffect, useMemo, useState } from 'react';
import { fetchPdfBuffer } from '../services/pdf.service';

export function usePdfDocument(documentId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // liberar el blob url al desmontar
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // Opción A: stream / arraybuffer
        const buffer = await fetchPdfBuffer(documentId);
        if (cancelled) return;

        const blob = new Blob([buffer], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'Error al cargar el PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return { url, loading, err };
}
