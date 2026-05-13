export function getDocumentDownloadHref(filePath: string) {
  if (filePath.startsWith('/api/documents/')) {
    return filePath
  }

  const filename = filePath.split('/').filter(Boolean).at(-1)
  return filename ? `/api/documents/${encodeURIComponent(filename)}` : '#'
}
