import { useState } from 'react'
import { useMondayPdf } from '../connector/use-monday-pdf'
import { PdfCanvas, PdfToolbar } from '../components/vistas-pdf'

type Props = { documentId?: string }

export default function DocumentPage({ documentId }: Props) {
  const [itemId, setItemId] = useState(documentId || '9233001281')
  const { url, meta, loading, err } = useMondayPdf(itemId)

  const [scale, setScale] = useState(1.1)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)

  if (loading) return <div className="p-6">Cargando…</div>
  if (err)     return <div className="p-6 text-red-600">Error: {err}</div>
  if (!url)    return <div className="p-6">Sin URL de documento.</div>

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
      {/* Entrada para probar distintos items */}
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 flex-1" value={itemId} onChange={e => setItemId(e.target.value)} />
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => setItemId(itemId.trim())}>
          Cargar
        </button>
      </div>

      <div className="rounded border p-3 bg-white">
        <h2 className="font-semibold text-lg">{meta?.name ?? `Item ${itemId}`}</h2>
        <p className="text-sm font-medium mt-2">Orden de firmantes:</p>
        <ol className="list-decimal list-inside">
          {(meta?.emails ?? []).map((email, i) => <li key={i}>{email}</li>)}
          {(!meta?.emails || meta?.emails.length === 0) && <li className="text-gray-500">Sin correos.</li>}
        </ol>
      </div>

      <PdfToolbar
        page={page}
        pages={pages}
        scale={scale}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => Math.min(pages || 1, p + 1))}
        onZoomIn={() => setScale(s => Math.min(4, s + 0.1))}
        onZoomOut={() => setScale(s => Math.max(0.5, s - 0.1))}
        onResetZoom={() => setScale(1.1)}
      />

      <PdfCanvas
        fileUrl={url}
        scale={scale}
        page={page}
        onDocumentLoad={(n) => {
          setPages(n)
          setPage(p => Math.min(p, n || 1))
        }}
      />
    </div>
  )
}
