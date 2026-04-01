export type JobData = {
  title?: string
  company?: string
  location?: string
  description?: string
  requirements?: string[]
  salary?: string
  url?: string
  extractedAt?: string
  [key: string]: unknown
}

export type ExtensionRequest =
  | { action: "extractJob"; data: JobData }
  | { action: "updatePopup"; data: JobData }
  | { action: "getJob" }
  | { action: "saveJob"; data: JobData }
  | { action: "showDetectionStatus"; data: Record<string, unknown> }
  | { action: "openDashboard"; data: JobData }
  | { action: "detectJob" }

export type ExtensionResponse =
  | { success: true; job?: JobData; analysis?: Record<string, unknown> }
  | { success: false; error: string }
