import api from "@/app/api/axios"
import {
  GeneratedEmail,
  ParsedCvSections,
} from "@/src/state/email-generator"

export type GenerateEmailPayload = {
  cv: File
  jobDescription: string
  recipientEmail: string
  recipientName?: string
  applicantName?: string
  additionalContext?: string
  tone?: string
}

export async function parseCvFile(cv: File): Promise<{
  parsed: ParsedCvSections
  meta: { cvOriginalName: string; cvTextLength: number }
}> {
  const formData = new FormData()
  formData.append("cv", cv)

  const response = await api.post("/api/email/parse-cv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function generateApplicationEmail(
  payload: GenerateEmailPayload
): Promise<GeneratedEmail> {
  const formData = new FormData()

  formData.append("cv", payload.cv)
  formData.append("jobDescription", payload.jobDescription)
  formData.append("recipientEmail", payload.recipientEmail)

  if (payload.recipientName) formData.append("recipientName", payload.recipientName)
  if (payload.applicantName) formData.append("applicantName", payload.applicantName)
  if (payload.additionalContext)
    formData.append("additionalContext", payload.additionalContext)
  if (payload.tone) formData.append("tone", payload.tone)

  const response = await api.post("/api/email/generate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}
