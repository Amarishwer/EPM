import crypto from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PROPERTY_IMAGE_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties')
const PROPERTY_IMAGE_PREFIX = '/uploads/properties'
const DOCUMENT_DIR = path.join(process.cwd(), 'uploads', 'documents')
const DOCUMENT_PREFIX = '/api/documents'
const MAX_TENANT_DOCUMENT_SIZE = 25 * 1024 * 1024
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp'])

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
}

async function persistFile(file: File, directory: string, publicPrefix: string) {
  await mkdir(directory, { recursive: true })

  const extension = path.extname(file.name).toLowerCase() || ''
  const filename = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(path.basename(file.name, extension))}${extension}`
  const outputPath = path.join(directory, filename)
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(outputPath, buffer)

  return {
    filePath: `${publicPrefix}/${filename}`,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  }
}

export async function saveUploadedImages(files: File[]) {
  if (!files.length) {
    return []
  }

  const storedPaths: string[] = []

  for (const file of files) {
    if (!file.size || !file.type.startsWith('image/')) {
      continue
    }

    const storedFile = await persistFile(file, PROPERTY_IMAGE_DIR, PROPERTY_IMAGE_PREFIX)
    storedPaths.push(storedFile.filePath)
  }

  return storedPaths
}

export async function saveUploadedDocument(file: File) {
  if (!file.size) {
    return null
  }

  if (file.size > MAX_TENANT_DOCUMENT_SIZE) {
    throw new Error('Document exceeds 25MB upload limit.')
  }

  const extension = path.extname(file.name).toLowerCase()
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type) || !ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    throw new Error('Document type is not allowed.')
  }

  return persistFile(file, DOCUMENT_DIR, DOCUMENT_PREFIX)
}

export { DOCUMENT_DIR, MAX_TENANT_DOCUMENT_SIZE }
