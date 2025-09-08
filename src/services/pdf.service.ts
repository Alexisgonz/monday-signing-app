import { http } from "./general-consultation";

export async function fetchPdfBuffer(itemId: string | number) {
  const res = await http.get(`/documents/${itemId}/pdf`, {
    responseType: "arraybuffer",
  });
  return res.data as ArrayBuffer;
}

export type ItemMeta = {
  id: string;
  name: string;
  fileUrl: string;
  emails: string[];
};

export async function fetchItemMeta(
  itemId: string | number
): Promise<ItemMeta> {
  const { data } = await http.get(`/documents/${itemId}/meta`);
  return data as ItemMeta;
}
