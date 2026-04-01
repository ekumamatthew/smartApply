import { CvTemplateComponentProps } from "./types"

export function CleanTemplate({ data }: CvTemplateComponentProps) {
  return (
    <div className="mx-auto min-h-[1120px] w-[794px] bg-white p-10 text-gray-900">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold">{data.personal.name}</h1>
        <p className="text-sm text-gray-600">{data.personal.role}</p>
        <p className="mt-2 text-xs text-gray-600">
          {[data.personal.email, data.personal.phone, data.personal.location]
            .filter(Boolean)
            .join(" • ")}
        </p>
      </header>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Profile</h2>
        <p className="mt-2 text-sm leading-6">{data.summary}</p>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Experience</h2>
        <div className="mt-2 space-y-3">
          {data.experience.map((item, idx) => (
            <div key={`${item.title}-${idx}`}>
              <p className="text-sm font-semibold">
                {item.title} {item.company ? `• ${item.company}` : ""}
              </p>
              <p className="text-xs text-gray-500">{item.period}</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {item.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className="rounded border px-2 py-1 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Education</h2>
          <div className="mt-2 space-y-2 text-sm">
            {data.education.map((item, idx) => (
              <p key={`${item.institution}-${idx}`}>
                <span className="font-semibold">{item.degree}</span>
                <br />
                {item.institution} {item.period ? `• ${item.period}` : ""}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
