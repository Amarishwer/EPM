import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { UserRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { DOCUMENT_DIR } from '@/lib/uploads'
import { prisma } from '@/lib/prisma'

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { filename } = await params
  const safeFilename = path.basename(decodeURIComponent(filename))
  if (!safeFilename || safeFilename !== decodeURIComponent(filename)) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const document = await prisma.tenantDocument.findFirst({
    where: {
      OR: [
        { filePath: `/api/documents/${safeFilename}` },
        { filePath: `/uploads/documents/${safeFilename}` },
      ],
    },
    select: {
      fileName: true,
      filePath: true,
      mimeType: true,
      tenantId: true,
      isVisibleToTenant: true,
    },
  })

  if (!document) {
    return new NextResponse('Not found', { status: 404 })
  }

  const isAdmin = session.user.role === UserRole.ADMIN
  const canTenantView = document.tenantId === session.user.id && document.isVisibleToTenant
  if (!isAdmin && !canTenantView) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const storagePath = path.join(DOCUMENT_DIR, safeFilename)
  const legacyStoragePath = path.join(process.cwd(), 'public', 'uploads', 'documents', safeFilename)

  let file: Buffer
  try {
    file = await readFile(storagePath)
  } catch {
    file = await readFile(legacyStoragePath)
  }

  const contentType = document.mimeType || MIME_TYPES[path.extname(safeFilename).toLowerCase()] || 'application/octet-stream'
  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Disposition': `inline; filename="${document.fileName.replace(/"/g, '')}"`,
    'Cache-Control': 'private, no-store',
  })

  return new NextResponse(file, { headers })
}
