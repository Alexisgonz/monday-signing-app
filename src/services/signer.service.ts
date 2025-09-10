const BASE = "/signer";

export type CreateProcessResult = {
  uuid?: string;
  configure_url?: string;
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

function filenameFromUrl(u: string, fallback = "documento.pdf") {
  try {
    const url = new URL(u, window.location.origin);
    const last = url.pathname.split("/").pop() || "";
    if (last.toLowerCase().endsWith(".pdf")) return last;
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
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  throw new Error(`Error HTTP ${resp.status}: ${body}`);
}

export async function sendToSigner(opts: {
  fileUrl: string;
  filename?: string;
  emails: string[];
  sequential?: boolean;
  mondayId?: string;
}): Promise<CreateProcessResult> {
  const { fileUrl, emails, sequential = false, mondayId } = opts;

  const r = await fetch(fileUrl);
  if (!r.ok) {
    const errBody = await r.text().catch(() => "");
    throw new Error(`No pude descargar el PDF (${r.status}) ${errBody}`);
  }
  const blob = await r.blob();

  const name = opts.filename || filenameFromUrl(fileUrl, "archivo.pdf");
  const file = new File([blob], name, { type: "application/pdf" });

  const formData = new FormData();
  formData.append("documents", file);
  emails.forEach((email) => formData.append("emails", email));
  formData.append("sequential", String(sequential));
  if (mondayId) formData.append("monday_id", mondayId);

  const resp = await fetch(`${BASE}/signatures/create/`, {
    method: "POST",
    body: formData,
  });

  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);

  return payload as CreateProcessResult;
}
export async function getProcessInfo(
  uuid: string
): Promise<CreateProcessResult> {
  const resp = await fetch(`${BASE}/signatures/${uuid}/`, { method: "GET" });
  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);
  return payload as CreateProcessResult;
}
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);
  return payload as CreateProcessResult;
}
export async function startSigningProcess(
  uuid: string
): Promise<{ detail: string }> {
  const resp = await fetch(`${BASE}/signatures/${uuid}/start/`, {
    method: "POST",
  });
  const payload = await readJsonOrText(resp);
  if (!resp.ok) throwHttp(resp, payload);
  return payload as { detail: string };
}

export function openAssignView(uuid: string, inNewTab = true) {
  const url = `${BASE}/signatures/assign/${uuid}/`;
  if (inNewTab) window.open(url, "_blank");
  else window.location.href = url;
}
