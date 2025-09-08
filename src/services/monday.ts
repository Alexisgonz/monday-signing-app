// src/services/monday.ts
type ItemMeta = {
  id: string
  name: string
  emails: string[]
  fileUrl: string | null
}

const FILE_COL_ID   = 'file_mkvgrw7j'
const STATUS_COL_ID = 'color_mkvh4f6v'
const EMAIL_COLS    = [
  'correo_electr_nico0__1',
  'correo_electr_nico6__1',
  'correo_electr_nico7__1',
  'correo_electr_nico__1',
  'correo_electr_nico1__1',
]

const ITEM_QUERY = `
  query GetItem($itemId: [ID!]) {
    items(ids: $itemId) {
      id
      name
      column_values(ids: [
        "${FILE_COL_ID}",
        "${STATUS_COL_ID}",
        ${EMAIL_COLS.map(id => `"${id}"`).join(',')}
      ]) { id text value }
      assets { id name public_url url }
    }
  }
`

export async function fetchItemMeta(itemId: string | number): Promise<ItemMeta> {
  const res = await fetch('/monday', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: ITEM_QUERY, variables: { itemId: Number(itemId) } })
  })

  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }

  const json = await res.json()
  const item = json?.data?.items?.[0]
  if (!item) throw new Error('Item not found')

  // emails
  const cvs = item.column_values as Array<{id:string;text?:string;value?:string}>
  const emails = EMAIL_COLS
    .map(id => cvs.find(c => c.id === id)?.text?.trim())
    .filter(Boolean)

  // archivo → preferir public_url, si no, url (protected_static)
  const assets = (item.assets || []) as Array<{id:string;name:string;public_url?:string;url?:string}>
  const fileCol = cvs.find(c => c.id === FILE_COL_ID)
  let picked = null as null | {public_url?:string;url?:string;name:string}

  // 1) por assetId dentro del JSON de la columna
  if (fileCol?.value) {
    try {
      const parsed = JSON.parse(fileCol.value) // {"files":[{ assetId | asset_id }]}
      const assetId = String(parsed?.files?.[0]?.assetId ?? parsed?.files?.[0]?.asset_id ?? '')
      picked = assets.find(a => a.id === assetId) || null
    } catch {}
  }

  // 2) fallback por nombre o primer PDF
  if (!picked) {
    const colText = fileCol?.text || ''
    picked =
      assets.find(a => a.name?.toLowerCase() === colText.split('/').pop()?.toLowerCase()) ||
      assets.find(a => a.name?.toLowerCase().endsWith('.pdf')) ||
      assets[0] || null
  }

  const fileUrl = picked?.public_url || picked?.url || null

  return {
    id: String(item.id),
    name: String(item.name),
    emails,
    fileUrl
  }
}
