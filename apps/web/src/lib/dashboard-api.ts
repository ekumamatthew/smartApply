import api from "@/app/api/axios"

export type EmailThreadSummary = {
  id: string
  jobDescription: string
  jobDescriptionHash: string
  emailCount: number
  latestEmailSubject: string | null
  latestAt: string
}

export type EmailHistoryItem = {
  id: string
  promptContext: string | null
  tone: string | null
  subject: string
  body: string
  keyHighlights: string[]
  createdAt: string
}

export type CvRecord = {
  id: string
  fileName: string
  storedPath: string
  mimeType: string
  sizeBytes: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type ParsedCvSections = {
  summary: string
  skills: string[]
  experience: string[]
  education: string[]
  certifications: string[]
}

export type CvParsedPreview = {
  cvId: string
  fileName: string
  parsed: ParsedCvSections
  fromCache: boolean
  parsedAt: string | null
}

export async function fetchEmailThreads(): Promise<EmailThreadSummary[]> {
  const response = await api.get("/api/email/threads")
  return response.data.threads || []
}

export async function fetchThreadMessages(
  threadId: string
): Promise<EmailHistoryItem[]> {
  const response = await api.get(`/api/email/threads/${threadId}/messages`)
  return response.data.messages || []
}

export async function fetchCvs(): Promise<CvRecord[]> {
  const response = await api.get("/api/cv")
  return response.data.cvs || []
}

export async function uploadCv(file: File): Promise<CvRecord | null> {
  const formData = new FormData()
  formData.append("cv", file)

  const response = await api.post("/api/cv/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data.cv || null
}

export async function setDefaultCv(cvId: string): Promise<CvRecord | null> {
  const response = await api.patch(`/api/cv/${cvId}/default`)
  return response.data.cv || null
}

export async function deleteCv(cvId: string): Promise<boolean> {
  const response = await api.delete(`/api/cv/${cvId}`)
  return Boolean(response.data.success)
}

export async function fetchCvParsedPreview(
  cvId: string,
  refresh = false
): Promise<CvParsedPreview> {
  const response = await api.get(`/api/cv/${cvId}/parsed`, {
    params: { refresh: refresh ? "true" : undefined },
  })
  return response.data
}
