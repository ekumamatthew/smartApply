// Background script for SwiftApplyHQ extension
import { EXT_WEB_APP_URL } from "../config/env"
import type { ExtensionRequest, ExtensionResponse } from "../types/messages"

console.log("SwiftApplyHQ background script loaded")

// Extension state
let extensionState = {
  isActive: true,
  currentJob: null,
  userToken: null,
  detectionStatus: null,
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(
  (
    request: ExtensionRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
  ) => {
  switch (request.action) {
    case "extractJob":
      handleJobExtraction(request.data, sendResponse)
      break
    case "getJob":
      sendResponse({ success: true, job: extensionState.currentJob })
      break
    case "saveJob":
      handleSaveJob(request.data, sendResponse)
      break
    case "showDetectionStatus":
      handleDetectionStatus(request.data, sendResponse)
      break
    case "openDashboard":
      handleOpenDashboard(request.data, sendResponse)
      break
    default:
      sendResponse({ success: false, error: "Unknown action" })
  }
  return true // Keep message channel open for async response
})

// Handle job extraction
async function handleJobExtraction(
  jobData: Record<string, unknown>,
  sendResponse: (response: ExtensionResponse) => void
) {
  try {
    extensionState.currentJob = jobData

    // Store in local storage
    await chrome.storage.local.set({
      lastExtractedJob: jobData,
      extractionTime: new Date().toISOString(),
    })

    // Send to backend if user is logged in
    if (extensionState.userToken) {
      await sendJobToBackend(jobData)
    }

    sendResponse({ success: true, job: jobData })
  } catch (error) {
    console.error("Error handling job extraction:", error)
    sendResponse({ success: false, error: error.message })
  }
}

// Handle saving job
async function handleSaveJob(
  jobData: Record<string, unknown>,
  sendResponse: (response: ExtensionResponse) => void
) {
  try {
    // Get saved jobs from storage
    const result = await chrome.storage.local.get(["savedJobs"])
    const savedJobs = result.savedJobs || []

    // Add new job
    savedJobs.push({
      ...jobData,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    })

    // Save back to storage
    await chrome.storage.local.set({ savedJobs })

    sendResponse({ success: true })
  } catch (error) {
    console.error("Error saving job:", error)
    sendResponse({ success: false, error: error.message })
  }
}

// Send job to backend
async function sendJobToBackend(jobData) {
  try {
    const response = await fetch(`${EXT_WEB_APP_URL}/api/jobs/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${extensionState.userToken}`,
      },
      body: JSON.stringify(jobData),
    })

    if (!response.ok) {
      throw new Error("Failed to send job to backend")
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending job to backend:", error)
    throw error
  }
}

// Handle detection status
async function handleDetectionStatus(
  analysis: Record<string, unknown>,
  sendResponse: (response: ExtensionResponse) => void
) {
  try {
    extensionState.detectionStatus = analysis

    // Store analysis for debugging
    await chrome.storage.local.set({
      lastDetectionAnalysis: analysis,
      analysisTime: new Date().toISOString(),
    })

    sendResponse({ success: true, analysis })
  } catch (error) {
    console.error("Error handling detection status:", error)
    sendResponse({ success: false, error: error.message })
  }
}

// Handle opening dashboard
async function handleOpenDashboard(
  jobData: Record<string, unknown>,
  sendResponse: (response: ExtensionResponse) => void
) {
  try {
    // Store job data for dashboard
    await chrome.storage.local.set({
      lastExtractedJob: jobData,
      extractionTime: new Date().toISOString(),
    })

    // Open dashboard
    chrome.tabs.create({
      url: `${EXT_WEB_APP_URL}/dashboard`,
    })

    sendResponse({ success: true })
  } catch (error) {
    console.error("Error opening dashboard:", error)
    sendResponse({ success: false, error: error.message })
  }
}

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Set default state
    chrome.storage.local.set({
      extensionState: extensionState,
      savedJobs: [],
    })

    // Open welcome page
    chrome.tabs.create({
      url: `${EXT_WEB_APP_URL}/welcome`,
    })
  }
})

// Handle tab updates for job detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Check if it's a job site
    const jobSites = [
      "linkedin.com/jobs",
      "indeed.com",
      "glassdoor.com",
      "monster.com",
      "ziprecruiter.com",
    ]

    const isJobSite = jobSites.some((site) => tab.url.includes(site))

    if (isJobSite) {
      // Notify content script to extract job data
      chrome.tabs.sendMessage(tabId, { action: "detectJob" } satisfies ExtensionRequest)
    }
  }
})

// Get user token from storage
chrome.storage.local.get(["userToken"], (result) => {
  if (result.userToken) {
    extensionState.userToken = result.userToken
  }
})
