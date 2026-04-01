import { CvTemplateComponentProps } from "./types"

export function SidebarTemplate({ data }: CvTemplateComponentProps) {
  return (
    <div className="mx-auto grid min-h-[1120px] w-[794px] grid-cols-[240px_1fr] bg-white text-slate-900">
      <aside className="bg-slate-900 p-6 text-slate-100">
        <h1 className="text-2xl font-bold leading-tight">{data.personal.name}</h1>
        <p className="mt-1 text-sm text-slate-300">{data.personal.role}</p>

        <div className="mt-6 space-y-2 text-xs">
          <p>{data.personal.email}</p>
          <p>{data.personal.phone}</p>
          <p>{data.personal.location}</p>
          {data.personal.links.map((link) => (
            <p key={link} className="break-all text-slate-300">
              {link}
            </p>
          ))}
        </div>

        <div className="mt-7">
          <h2 className="text-xs uppercase tracking-widest text-slate-400">Skills</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {data.skills.map((skill) => (
              <li key={skill}>• {skill}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="p-8">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Profile</h2>
          <p className="mt-2 text-sm leading-6">{data.summary}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Experience</h2>
          <div className="mt-3 space-y-3">
            {data.experience.map((item, idx) => (
              <div key={`${item.title}-${idx}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {item.title} {item.company ? `• ${item.company}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">{item.period}</p>
                </div>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {item.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Education</h2>
          <div className="mt-2 space-y-2 text-sm">
            {data.education.map((item, idx) => (
              <p key={`${item.institution}-${idx}`}>
                <span className="font-semibold">{item.degree}</span> • {item.institution}
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
