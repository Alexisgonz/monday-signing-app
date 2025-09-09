// src/connector/use-monday-pdf.ts
import { useCallback, useEffect, useState } from 'react';
import { fetchItemMeta } from '../services/monday';
import {
  createSignatureProcess,
  configureSignatureFields,
  downloadAsPdfFile,
  type ConfigureFieldsPayload,
} from '../services/signer.service';

type Meta = { name: string; emails: string[] };

function toProxied(url: string) {
  if (url.startsWith('/proxy-file?u=')) return url;
  return `/proxy-file?u=${encodeURIComponent(url)}`;
}

export function useMondayPdf(itemId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // estado para el envío al gestor de firmas
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [processInfo, setProcessInfo] = useState<any>(null);

  // liberar blob si lo hubiera (hoy estamos usando URL remota proxied)
  useEffect(
    () => () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    },
    [url],
  );

  // Cargar meta (nombre, emails) y URL proxied del PDF
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

  /**
   * Envía PDF + correos al gestor de firmas (Django).
   * - sequential: si quieres marcar el flujo secuencial al crear
   * - fields: payload opcional para /configure_fields/ (si ya tienes assignment_id/document_id)
   *
   * Retorna el objeto del proceso creado (con uuid, etc.).
   */
  const sendToSigner = useCallback(
    async (opts?: { sequential?: boolean; fields?: ConfigureFieldsPayload }) => {
      if (!meta?.emails?.length) throw new Error('No hay correos para firmar.');
      if (!url) throw new Error('No hay PDF disponible.');

      setSending(true);
      setSendError(null);
      setProcessInfo(null);

      try {
        // 1) Descargar el PDF (desde el proxy /proxy-file)
        console.log('Descargando PDF desde:', url);
        const file = await downloadAsPdfFile(url, `${meta?.name || 'document'}.pdf`);
        console.log('PDF descargado correctamente:', file.name, 'tamaño:', file.size);

        // 2) Crear proceso en Django
        console.log('Enviando a API de firmas:', meta.emails, 'secuencial:', opts?.sequential);
        const proceso = await createSignatureProcess({
          file,
          emails: meta.emails,
          sequential: opts?.sequential,
        });
        console.log('Proceso de firma creado exitosamente:', proceso);

        // 3) (Opcional) Configurar campos/orden si ya los tienes listos
        if (opts?.fields && proceso?.uuid) {
          console.log('Configurando campos de firma:', opts.fields);
          await configureSignatureFields(proceso.uuid, opts.fields);
          console.log('Campos configurados correctamente');
        }

        setProcessInfo(proceso);
        return proceso;
      } catch (e: any) {
        console.error('Error al enviar al gestor de firmas:', e);
        const errorMsg = e?.message || 'Error enviando al gestor de firmas';
        setSendError(errorMsg);
        throw e;
      } finally {
        setSending(false);
      }
    },
    [meta, url],
  );

  return {
    // datos del PDF de Monday
    url,
    meta,
    loading,
    err,

    // acciones hacia el gestor de firmas
    sendToSigner,
    sending,
    sendError,
    processInfo,
  };
}
