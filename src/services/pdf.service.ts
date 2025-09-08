import { http } from "./general-consultation";

export async function fetchPdfBuffer(documentId: string): Promise<ArrayBuffer> {
  try {
    console.log(`Fetching PDF for document: ${documentId}`);
    const { data } = await http.get<ArrayBuffer>(`/documents/${documentId}/pdf`, {
      responseType: "arraybuffer",
    });
    console.log("PDF fetched successfully");
    return data;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    throw error;
  }
}

export async function fetchPdfBase64(documentId: string): Promise<string> {
  const { data } = await http.get<{ base64: string }>(
    `/documents/${documentId}/pdf-base64`
  );
  return data.base64;
}
