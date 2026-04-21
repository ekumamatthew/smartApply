import api from "@/app/api/axios"
import {
  GeneratedEmail,
  ParsedCvSections,
} from "@/src/state/email-generator"

export type GenerateEmailPayload = {
  cv?: File
  cvId?: string
  jobDescription: string
  recipientEmail?: string
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
  if (!payload.cv && !payload.cvId) {
    throw new Error("Provide either cv file or cvId")
  }

  const baseBody = {
    cvId: payload.cvId,
    jobDescription: payload.jobDescription,
    recipientName: payload.recipientName,
    applicantName: payload.applicantName,
    additionalContext: payload.additionalContext,
    tone: payload.tone,
    ...(payload.recipientEmail && payload.recipientEmail.trim()
      ? { recipientEmail: payload.recipientEmail }
      : {}),
  }

  const response = payload.cv
    ? await (() => {
        const formData = new FormData()
        formData.append("cv", payload.cv as File)
        formData.append("jobDescription", payload.jobDescription)
        if (payload.recipientEmail && payload.recipientEmail.trim()) {
          formData.append("recipientEmail", payload.recipientEmail)
        }
        if (payload.recipientName) formData.append("recipientName", payload.recipientName)
        if (payload.applicantName) formData.append("applicantName", payload.applicantName)
        if (payload.additionalContext)
          formData.append("additionalContext", payload.additionalContext)
        if (payload.tone) formData.append("tone", payload.tone)

        return api.post("/api/email/generate", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      })()
    : await api.post("/api/email/generate", baseBody)

  return response.data
}
