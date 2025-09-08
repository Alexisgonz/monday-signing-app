// src/connector/use-monday-pdf.ts
import { useEffect, useState } from 'react'
import { fetchItemMeta } from '../services/pdf.service';

export function useMondayPdf(itemId: string) {
  const [url, setUrl] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ name: string; emails: string[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // liberar blob al desmontar
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        setUrl(null)

        const m = await fetchItemMeta(itemId)
        if (cancelled) return
        setMeta({ name: m.name, emails: m.emails })

        if (!m.fileUrl) throw new Error('Este item no tiene PDF')

        // si es URL pública (S3), descargamos desde el browser
        const isPublic = m.fileUrl.startsWith('https://files-monday-com.s3')
        if (!isPublic) throw new Error('El archivo no tiene public_url (requiere proxy/servidor).')

        const r = await fetch(m.fileUrl)
        if (!r.ok) throw new Error(`Descarga falló: ${r.status}`)
        const blob = await r.blob()
        const objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setUrl(objectUrl)
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error cargando PDF')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [itemId])

  return { url, meta, loading, err }
}
