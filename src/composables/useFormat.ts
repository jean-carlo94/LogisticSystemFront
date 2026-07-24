export function formatDate(iso: string, style: 'full' | 'short' = 'full'): string {
  const options: Intl.DateTimeFormatOptions = style === 'short'
    ? { dateStyle: 'short' }
    : { dateStyle: 'short', timeStyle: 'short' }
  return new Date(iso).toLocaleString('es-PE', options)
}
