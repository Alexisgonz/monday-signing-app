// src/services/signer.service.ts
import { API_CONFIG } from '../config/api-config';

export interface CreateProcessResponse {
  uuid: string; // uuid del proceso
  sequential?: boolean;
  documents?: any[];
  signers?: any[];
  assignments?: Array<{ id: number; access_token: string; order: number }>;
  [k: string]: any;
}

export interface ConfigureFieldsPayload {
  sequential?: boolean;
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

export async function createSignatureProcess(params: {
  file: File | Blob;
  emails: string[]; // lista de correos
  sequential?: boolean; // si tu serializer lo acepta aquí
}): Promise<CreateProcessResponse> {
  const fd = new FormData();

  const pdf =
    params.file instanceof File
      ? params.file
      : new File([params.file], "document.pdf", { type: "application/pdf" });

  fd.append("documents", pdf, pdf.name);

  // Envía emails como CSV para máxima compatibilidad con tu serializer actual.
  fd.append("emails", params.emails.join(","));

  if (typeof params.sequential === "boolean") {
    fd.append("sequential", String(params.sequential));
  }

  try {
    const endpoint = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.createProcess}`;
    console.log(`Enviando solicitud a ${endpoint}`);
    console.log(`Archivo: ${pdf.name} (${pdf.size} bytes)`);
    console.log(`Correos: ${params.emails.join(", ")}`);
    console.log(`Firma secuencial: ${params.sequential}`);

    const res = await fetch(endpoint, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Error en API (${res.status}):`, text);
      throw new Error(`Error al crear proceso de firma: ${res.status} – ${text || "Sin detalles"}`);
    }
    
    const data = await res.json();
    console.log("Respuesta API:", data);
    return data;
  } catch (error: any) {
    console.error("Error en createSignatureProcess:", error);
    throw new Error(`Error al crear proceso de firma: ${error.message || "Error desconocido"}`);
  }
}

export async function configureSignatureFields(
  processUuid: string,
  payload: ConfigureFieldsPayload
) {
  const endpoint = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.configureFields(processUuid)}`;
  const res = await fetch(
    endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`configureSignatureFields HTTP ${res.status} – ${text}`);
  }
  return res.json();
}

export async function saveSignature(
  assignmentToken: string,
  signatureDataUrl: string,
  saveForLater = false
) {
  const endpoint = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.saveSignature(assignmentToken)}`;
  const res = await fetch(
    endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature: signatureDataUrl,
        save_for_later: saveForLater,
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`saveSignature HTTP ${res.status} – ${text}`);
  }
  return res.json();
}

/** Útil si quieres bajar el PDF de Monday (o de tu proxy) y convertir a File */
export async function downloadAsPdfFile(
  url: string,
  name = "document.pdf",
  headers?: Record<string, string>
) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`Download failed: ${r.status}`);
  const blob = await r.blob();
  return new File([blob], name, { type: "application/pdf" });
}
