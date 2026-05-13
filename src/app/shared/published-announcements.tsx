import { AnnouncementAudience } from '@prisma/client'

import { formatDate } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export async function PublishedAnnouncements({
  audience,
}: {
  audience: AnnouncementAudience | 'PUBLIC'
}) {
  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      audience:
        audience === 'PUBLIC'
          ? {
              in: [AnnouncementAudience.TENANTS, AnnouncementAudience.BOTH],
            }
          : audience,
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 5,
  })

  if (!announcements.length) {
    return null
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Announcements</p>
      <div className="mt-5 space-y-4">
        {announcements.map((announcement) => (
          <article key={announcement.id} className="rounded-3xl border border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-950">{announcement.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{announcement.body}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
              Published {formatDate(announcement.publishedAt ?? announcement.createdAt)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
