export function formatDate(iso: string, style: 'full' | 'short' = 'full'): string {
  const options: Intl.DateTimeFormatOptions = style === 'short'
    ? { dateStyle: 'short' }
    : { dateStyle: 'short', timeStyle: 'short' }
  return new Date(iso).toLocaleString('es-PE', options)
}

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = import.meta.env.VITE_API_BASE_URL
  if (!base) return path
  try {
    const baseUrl = new URL(base)
    return `${baseUrl.origin}${path}`
  } catch {
    return path
  }
}
