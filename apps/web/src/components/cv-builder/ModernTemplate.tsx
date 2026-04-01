import { CvTemplateComponentProps } from "./types"

export function ModernTemplate({ data }: CvTemplateComponentProps) {
  return (
    <div className="mx-auto min-h-[1120px] w-[794px] bg-white p-10 text-slate-900">
      <header className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
        <h1 className="text-3xl font-bold">{data.personal.name}</h1>
        <p className="text-sm opacity-90">{data.personal.role}</p>
        <p className="mt-2 text-xs opacity-90">
          {[data.personal.email, data.personal.phone, data.personal.location]
            .filter(Boolean)
            .join(" • ")}
        </p>
      </header>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">Summary</h2>
        <p className="mt-2 text-sm leading-6">{data.summary}</p>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">Experience</h2>
        <div className="mt-3 space-y-3">
          {data.experience.map((item, idx) => (
            <article key={`${item.title}-${idx}`} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-slate-500">{item.period}</p>
              </div>
              <p className="text-xs text-slate-500">{item.company}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {item.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">Projects</h2>
          <div className="mt-2 space-y-2 text-sm">
            {data.projects.map((project, idx) => (
              <p key={`${project.name}-${idx}`}>
                <span className="font-semibold">{project.name}</span>: {project.description}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
