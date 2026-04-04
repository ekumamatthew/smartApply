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

export type CvTemplate = {
  id: string
  slug: string
  name: string
  description: string
  standard: "ats" | "modern" | "executive" | "academic" | "general"
  preview: string
  sortOrder: number
}

export type CvOptimizationHistoryItem = {
  id: string
  cvId: string
  standard: string
  templateId: string
  templateName: string
  jobDescription: string
  requestedKeywords: string[]
  extractedKeywords: string[]
  missingKeywords: string[]
  structuredCvJson: StructuredCvData | null
  optimizedCvText: string
  atsScore: number
  recommendations: string[]
  createdAt: string
}

export type StructuredCvData = {
  personal: {
    name: string
    email: string
    phone: string
    location: string
    links: string[]
  }
  targetRole: string
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

export type OptimizeCvPayload = {
  cvId?: string
  jobDescription: string
  standard?: "ats" | "modern" | "executive" | "academic" | "general"
  templateId?: string
  keywords?: string[]
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientLocation?: string
}

export type UserProfileSettings = {
  fullName: string
  email: string
  phone: string
  linkedin: string
  professionalSummary: string
}

export type UserNotificationSettings = {
  emailNotifications: boolean
  applicationUpdates: boolean
  interviewReminders: boolean
  followUpReminders: boolean
  weeklyReports: boolean
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

export async function fetchCvTemplates(): Promise<CvTemplate[]> {
  const response = await api.get("/api/cv/templates")
  return response.data.templates || []
}

export async function optimizeCv(
  payload: OptimizeCvPayload
): Promise<{
  optimizationId: string
  cvId: string
  cvFileName: string
  standard: string
  template: CvTemplate
  result: {
    optimizedCvText: string
    extractedKeywords: string[]
    missingKeywords: string[]
    atsScore: number
    recommendations: string[]
  }
}> {
  const response = await api.post("/api/cv/optimize", payload)
  return response.data
}

export async function fetchCvOptimizationHistory(
  cvId: string
): Promise<CvOptimizationHistoryItem[]> {
  const response = await api.get(`/api/cv/${cvId}/optimizations`)
  return response.data.history || []
}

export async function fetchSettings(): Promise<{
  profile: UserProfileSettings
  notifications: UserNotificationSettings
}> {
  const response = await api.get("/api/settings")
  return response.data
}

export async function updateProfileSettings(
  payload: Partial<Omit<UserProfileSettings, "email">>
): Promise<UserProfileSettings> {
  const response = await api.patch("/api/settings/profile", payload)
  return response.data.profile
}

export async function updateNotificationSettings(
  payload: Partial<UserNotificationSettings>
): Promise<UserNotificationSettings> {
  const response = await api.patch("/api/settings/notifications", payload)
  return response.data.notifications
}
