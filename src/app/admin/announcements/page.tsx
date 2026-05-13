import { AnnouncementAudience } from '@prisma/client'

import {
  createAnnouncementAction,
  toggleAnnouncementPublishAction,
} from '@/app/admin/announcements/actions'
import { formatDate } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    include: {
      createdBy: true,
    },
    orderBy: [{ isPublished: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Announcements</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Publish updates for admins and tenants</h1>
      </section>

      <form action={createAnnouncementAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Create announcement</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="block lg:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Announcement title</span><input required name="title" placeholder="Announcement title" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Audience</span><select name="audience" defaultValue={AnnouncementAudience.BOTH} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
              {Object.values(AnnouncementAudience).map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select></label>
          <label className="block lg:col-span-3"><span className="mb-2 block text-sm font-medium text-slate-700">Announcement body</span><textarea required name="body" rows={5} placeholder="Write the announcement body" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="inline-flex items-center gap-3 text-sm text-slate-600 lg:col-span-3">
            <input type="checkbox" name="isPublished" value="1" className="h-4 w-4 rounded border-slate-300" />
            Publish immediately
          </label>
        </div>
        <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] text-white transition hover:bg-slate-800">
          SAVE ANNOUNCEMENT
        </button>
      </form>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Announcement list</h2>
        <div className="mt-6 space-y-4">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{announcement.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Audience: {announcement.audience} - Created by {announcement.createdBy?.email ?? 'Unknown'} on {formatDate(announcement.createdAt)}
                  </p>
                </div>
                <form action={toggleAnnouncementPublishAction}>
                  <input type="hidden" name="announcementId" value={announcement.id} />
                  <input type="hidden" name="shouldPublish" value={announcement.isPublished ? '0' : '1'} />
                  <button type="submit" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-slate-700 transition hover:bg-slate-100">
                    {announcement.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                  </button>
                </form>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{announcement.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
