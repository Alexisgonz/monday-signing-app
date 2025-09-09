import { useEffect, useState } from 'react';
import { fetchItemMeta } from '../services/monday';

function toProxied(url: string) {
  if (url.startsWith('/proxy-file?u=')) return url;
  return `/proxy-file?u=${encodeURIComponent(url)}`;
}

export function useMondayPdf(itemId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ name: string; emails: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    },
    [url],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setUrl(null);

        console.log('Fetching metadata for item:', itemId);
        const m = await fetchItemMeta(itemId);
        if (cancelled) return;

        console.log('Received item metadata:', m);
        setMeta({ name: m.name, emails: m.emails });

        if (!m.fileUrl) {
          console.error('No fileUrl in item metadata');
          throw new Error('Este item no tiene PDF');
        }
        const proxied = toProxied(m.fileUrl);
        const absolute = new URL(proxied, window.location.origin).toString();

        console.log('File URL (proxied):', absolute);
        setUrl(absolute);
      } catch (e: any) {
        console.error('Error in useMondayPdf:', e);
        if (!cancelled) setErr(e?.message || 'Error cargando PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return { url, meta, loading, err };
}
