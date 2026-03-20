import { atom } from "jotai"

export type ParsedCvSections = {
  summary: string
  skills: string[]
  experience: string[]
  education: string[]
  certifications: string[]
}

export type GeneratedEmail = {
  subject: string
  body: string
  keyHighlights: string[]
  meta?: {
    cvOriginalName: string
    cvTextLength: number
  }
}

export type EmailGeneratorFormState = {
  jobUrl: string
  jobDescription: string
  recipientEmail: string
  recipientName: string
  applicantName: string
  tone: "professional" | "confident" | "friendly" | "formal"
  additionalContext: string
}

export const emailGeneratorFormAtom = atom<EmailGeneratorFormState>({
  jobUrl: "",
  jobDescription: "",
  recipientEmail: "",
  recipientName: "",
  applicantName: "",
  tone: "professional",
  additionalContext: "",
})

export const uploadedCvAtom = atom<File | null>(null)

export const parsedCvAtom = atom<ParsedCvSections | null>(null)

export const generatedEmailAtom = atom<GeneratedEmail | null>(null)

export const generatorErrorAtom = atom<string>("")
