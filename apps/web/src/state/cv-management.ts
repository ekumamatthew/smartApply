import { atom } from "jotai"

export const selectedCvIdAtom = atom<string | null>(null)
export const cvManagementErrorAtom = atom<string>("")

export type CvOptimizationFormState = {
  jobDescription: string
  standard: "ats" | "modern" | "executive" | "academic" | "general"
  templateId: string
  keywordsCsv: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientLocation: string
}

export const cvOptimizationFormAtom = atom<CvOptimizationFormState>({
  jobDescription: "",
  standard: "ats",
  templateId: "",
  keywordsCsv: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientLocation: "",
})
