import { StructuredCvData } from "@/src/lib/dashboard-api"
import type React from "react"

export type TemplateFieldMap = {
  name: string
  role: string
  email: string
  phone: string
  location: string
  links: string
  summary: string
  skills: string
}

export type CvTemplateViewModel = {
  personal: {
    name: string
    role: string
    email: string
    phone: string
    location: string
    links: string[]
  }
  summary: string
  skills: string[]
  experience: Array<{
    title: string
    company: string
    period: string
    highlights: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    period: string
    details: string[]
  }>
  certifications: string[]
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
}

export type CvTemplateComponentProps = {
  data: CvTemplateViewModel
}

export type CvTemplateDefinition = {
  id: string
  label: string
  description: string
  Component: React.ComponentType<CvTemplateComponentProps>
}

export function fallbackStructuredCv(rawText: string): StructuredCvData {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const summary = lines.slice(0, 4).join(" ")
  return {
    personal: {
      name: lines[0] || "Client Name",
      email: "",
      phone: "",
      location: "",
      links: [],
    },
    targetRole: "Professional",
    summary,
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
  }
}

function getPathValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc !== "object" || acc === null || !(key in acc)) return undefined
    return (acc as Record<string, unknown>)[key]
  }, obj)
}

export function mapStructuredCvToViewModel(
  raw: StructuredCvData,
  fieldMap: TemplateFieldMap = {
    name: "personal.name",
    role: "targetRole",
    email: "personal.email",
    phone: "personal.phone",
    location: "personal.location",
    links: "personal.links",
    summary: "summary",
    skills: "skills",
  }
): CvTemplateViewModel {
  const name = String(getPathValue(raw, fieldMap.name) || "Client Name")
  const role = String(getPathValue(raw, fieldMap.role) || "Professional")
  const email = String(getPathValue(raw, fieldMap.email) || "")
  const phone = String(getPathValue(raw, fieldMap.phone) || "")
  const location = String(getPathValue(raw, fieldMap.location) || "")
  const linksRaw = getPathValue(raw, fieldMap.links)
  const summary = String(getPathValue(raw, fieldMap.summary) || "")
  const skillsRaw = getPathValue(raw, fieldMap.skills)

  return {
    personal: {
      name,
      role,
      email,
      phone,
      location,
      links: Array.isArray(linksRaw) ? linksRaw.map(String) : [],
    },
    summary,
    skills: Array.isArray(skillsRaw) ? skillsRaw.map(String) : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],
  }
}
