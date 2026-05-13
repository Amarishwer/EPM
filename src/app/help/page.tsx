import { PublishedAnnouncements } from '@/app/shared/published-announcements'

export default async function HelpPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-4xl font-semibold text-slate-950">Help and contact</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Questions about your balance, payments, registration status, or navigating the website? Reach out and we will help you from the admin side while the tenant portal continues rolling out.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold">Email:</span> info@edamproperty.com</p>
            <p><span className="font-semibold">Phone:</span> +91 9440348141</p>
            <p><span className="font-semibold">Address:</span> H.no: 11-11-143, Telephone colony, Saroornagar, Hyderabad, Telangana 500035, India.</p>
          </div>
        </section>

        <PublishedAnnouncements audience="PUBLIC" />
      </div>
    </div>
  )
}
