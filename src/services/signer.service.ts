// src/services/signer.service.ts

// /signer está proxyeado en vite.config.ts hacia tu Django (127.0.0.1:8000)
const BASE = '/signer';

/* =========================
 *   Tipos de respuesta
 * ========================= */
export type CreateProcessResult = {
  uuid?: string;
  sequential?: boolean;
  status?: string;
  assignments?: Array<{
    email: string;
    assignment_id?: number;
    access_token?: string;
    order?: number;
    status?: string;
  }>;
  documents?: Array<{
    id: number;
    name: string;
    file?: string;
  }>;
};

function filenameFromUrl(u: string, fallback = 'documento.pdf') {
  try {
    const url = new URL(u, window.location.origin);
    const last = url.pathname.split('/').pop() || '';
    if (last.toLowerCase().endsWith('.pdf')) return last;
    return fallback;
  } catch {
    return fallback;
  }
}

async function readJsonOrText(resp: Response) {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function throwHttp(resp: Response, payload: unknown): never {
  const body =
    typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  throw new Error(`Error HTTP ${resp.status}: ${body}`);
}

/* ======================================
 * 1) Crear proceso: /signatures/create/
 * ====================================== */
export async function sendToSigner(opts: {
  fileUrl: string;        // URL proxyeada del PDF (la misma que usas en el visor)
  filename?: string;      // opcional, si quieres sobreescribir el nombre
  emails: string[];       // orden de firmantes
  sequential?: boolean;   // default false
}): Promise<CreateProcessResult> {
  const { fileUrl, emails, sequential = false } = opts;

  // 1) Descargar el PDF (desde tu proxy /proxy-file)
  const r = await fetch(fileUrl);
  if (!r.ok) {
    const errBody = await r.text().catch(() => '');
    throw new Error(`No pude descargar el PDF (${r.status}) ${errBody}`);
  }
  const blob = await r.blob();

  const name = opts.filename || filenameFromUrl(fileUrl, 'archivo.pdf');
  const file = new File([blob], name, { type: 'application/pdf' });

  // 2) FormData como espera tu serializer (documents[], emails[], sequential)
  const formData = new FormData();
  formData.append('documents', file);
  emails.forEach((email) => formData.append('emails', email));
  formData.append('sequential', String(sequential));

  // 3) POST a Django
  const resp = await fetch(`${BASE}/signatures/create/`, {
    method: 'POST',
    body: formData,
  });

  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);

  // payload debe ser el JSON del proceso creado con uuid, assignments, etc.
  return payload as CreateProcessResult;
}

/* =========================================
 * 2) Obtener detalle del proceso (retrieve)
 *     GET /signatures/{uuid}/
 * ========================================= */
export async function getProcessInfo(uuid: string): Promise<CreateProcessResult> {
  const resp = await fetch(`${BASE}/signatures/${uuid}/`, { method: 'GET' });
  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);
  return payload as CreateProcessResult;
}

/* =========================================
 * 3) Configurar campos de firma
 *     POST /signatures/{uuid}/configure_fields/
 * ========================================= */
export async function configureSignatureFields(
  uuid: string,
  config: {
    sequential: boolean;
    assignments: Array<{
      assignment_id: number;
      order: number;
      fields: Array<{
        document_id: number;
        coordinates: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          page: number;
        }>;
      }>;
    }>;
  }
): Promise<CreateProcessResult> {
  const resp = await fetch(`${BASE}/signatures/${uuid}/configure_fields/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);
  return payload as CreateProcessResult;
}

/* =========================================
 * 4) Iniciar el proceso (envía notificaciones)
 *     POST /signatures/{uuid}/start/
 * ========================================= */
export async function startSigningProcess(
  uuid: string
): Promise<{ detail: string }> {
  const resp = await fetch(`${BASE}/signatures/${uuid}/start/`, {
    method: 'POST',
  });
  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);
  return payload as { detail: string };
}

/* ==============================================================
 * 5) Utilidad opcional: abrir la vista de asignación en Django
 *    Si mapeaste en urls.py:
 *      path('signatures/assign/<uuid>/', SignatureProcessViewSet.as_view({...}))
 *    usa esta URL. Si la expusiste como @action(detail=True) 'assign_signatures',
 *    cambia el path a `/signatures/${uuid}/assign_signatures/`.
 * ============================================================== */
export function openAssignView(uuid: string, inNewTab = true) {
  const url = `${BASE}/signatures/assign/${uuid}/`; // o: `${BASE}/signatures/${uuid}/assign_signatures/`
  if (inNewTab) window.open(url, '_blank');
  else window.location.href = url;
}
