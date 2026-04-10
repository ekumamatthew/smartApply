// AI-powered job detection for any website
import type { ExtensionRequest } from "../types/messages"

console.log("SwiftApplyHQ AI job detector loaded")

// Job-related keywords and patterns
const JOB_KEYWORDS = {
  titles: [
    "software engineer",
    "developer",
    "programmer",
    "full stack",
    "frontend",
    "backend",
    "data scientist",
    "data analyst",
    "product manager",
    "project manager",
    "designer",
    "marketing manager",
    "sales representative",
    "account manager",
    "business analyst",
    "consultant",
    "analyst",
    "specialist",
    "coordinator",
    "assistant",
    "manager",
    "director",
    "vp",
    "vice president",
    "chief",
    "cto",
    "ceo",
    "cfo",
    "cio",
  ],
  action_words: [
    "hire",
    "joining",
    "apply",
    "application",
    "career",
    "opportunity",
    "position",
    "role",
    "vacancy",
    "opening",
    "job",
    "employment",
    "recruit",
    "talent",
  ],
  requirements: [
    "requirements",
    "qualifications",
    "skills",
    "experience",
    "education",
    "degree",
    "years of experience",
    "responsibilities",
    "duties",
    "what you'll do",
  ],
  benefits: [
    "salary",
    "compensation",
    "benefits",
    "perks",
    "remote",
    "hybrid",
    "onsite",
    "full-time",
    "part-time",
    "contract",
    "permanent",
    "temporary",
  ],
}

// HTML patterns that commonly contain job information
const JOB_SELECTORS = {
  titles: [
    "h1",
    "h2",
    "h3",
    '[class*="title"]',
    '[class*="position"]',
    '[class*="role"]',
    '[id*="title"]',
    '[id*="position"]',
    '[id*="role"]',
    "title",
    ".title",
    ".position",
    ".role",
  ],
  companies: [
    '[class*="company"]',
    '[class*="employer"]',
    '[class*="organization"]',
    '[id*="company"]',
    '[id*="employer"]',
    '[id*="organization"]',
    ".company",
    ".employer",
    ".organization",
  ],
  locations: [
    '[class*="location"]',
    '[class*="address"]',
    '[class*="city"]',
    '[id*="location"]',
    '[id*="address"]',
    '[id*="city"]',
    ".location",
    ".address",
    ".city",
  ],
  descriptions: [
    '[class*="description"]',
    '[class*="about"]',
    '[class*="details"]',
    '[id*="description"]',
    '[id*="about"]',
    '[id*="details"]',
    ".description",
    ".about",
    ".details",
    "article",
    "main",
    '[role="main"]',
  ],
}

// Platform-specific patterns (fallback)
const jobPatterns = {
  linkedin: {
    title: [".top-card-layout__entity-title h1", ".top-card-layout__title h1"],
    company: [
      ".topcard-v2-organization .topcard-v2-organization-name",
      ".top-card-layout__entity-info .top-card-layout__secondary-subtitle",
    ],
    location: [
      ".topcard-v2-organization .topcard-v2-organization__location-text",
      ".top-card-layout__entity-info .top-card-layout__secondary-subtitle",
    ],
    description: [".description__text", ".show-more-less-html__text"],
    requirements: [
      ".description__text ul li",
      ".show-more-less-html__text ul li",
    ],
  },
  indeed: {
    title: ["h1.jobsearch-JobInfo-title", ".jobsearch-JobInfo-title h1"],
    company: [
      ".jobsearch-CompanyInfoWithoutHeader a",
      ".jobsearch-DesktopStickyContainer-companyInfo a",
    ],
    location: [
      ".jobsearch-JobInfo-location",
      ".jobsearch-DesktopStickyContainer-companyInfo .jobsearch-JobInfo-location",
    ],
    description: ['[id="jobDescriptionText"]', ".jobsearch-jobDescriptionText"],
    requirements: [
      '[id="jobDescriptionText"] ul li',
      ".jobsearch-jobDescriptionText ul li",
    ],
  },
  glassdoor: {
    title: [".jobTitle", ".css-1x7zr4 h1"],
    company: [".css-1vuy1n", ".employerName"],
    location: [".css-1qgt3i", ".location"],
    description: [".jobDescription", ".css-1vuy1n + div"],
    requirements: [".jobDescription ul li", ".css-1vuy1n + div ul li"],
  },
}

// AI-powered job content analysis
class AIJobDetector {
  constructor() {
    this.confidence_threshold = 0.6
    this.last_analysis = null
  }

  // Analyze page content for job signals
  analyzePage() {
    const pageText = this.getPageText()
    const pageStructure = this.analyzePageStructure()
    const url_signals = this.analyzeURL()

    const signals = {
      text: this.analyzeTextSignals(pageText),
      structure: pageStructure,
      url: url_signals,
    }

    const confidence = this.calculateConfidence(signals)
    const isJobPage = confidence >= this.confidence_threshold

    this.last_analysis = {
      isJobPage,
      confidence,
      signals,
      timestamp: new Date().toISOString(),
    }

    return this.last_analysis
  }

  // Get all text content from page
  getPageText() {
    const textContent = document.body.innerText || ""
    const title = document.title || ""
    const metaDescription = this.getMetaDescription()

    return `${title} ${metaDescription} ${textContent}`.toLowerCase()
  }

  // Get meta description
  getMetaDescription() {
    const meta = document.querySelector('meta[name="description"]')
    return meta ? meta.content : ""
  }

  // Analyze text for job-related signals
  analyzeTextSignals(text) {
    const signals = {
      keyword_matches: 0,
      title_matches: 0,
      action_matches: 0,
      requirement_matches: 0,
      benefit_matches: 0,
      total_words: text.split(/\s+/).length,
    }

    // Count keyword matches
    Object.entries(JOB_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach((keyword) => {
        const regex = new RegExp(keyword, "gi")
        const matches = text.match(regex)
        if (matches) {
          signals[`${category}_matches`] += matches.length
          signals.keyword_matches += matches.length
        }
      })
    })

    // Calculate keyword density
    signals.keyword_density = signals.keyword_matches / signals.total_words

    return signals
  }

  // Analyze page structure for job patterns
  analyzePageStructure() {
    const structure = {
      has_application_form: false,
      has_apply_button: false,
      has_job_schema: false,
      form_elements: 0,
      buttons: 0,
    }

    // Check for application forms
    const forms = document.querySelectorAll("form")
    const applyButtons = document.querySelectorAll(
      'button, a, input[type="submit"]'
    )

    structure.form_elements = forms.length
    structure.buttons = applyButtons.length

    // Look for apply-related buttons
    applyButtons.forEach((element) => {
      const text = (element.textContent || element.value || "").toLowerCase()
      if (text.includes("apply") || text.includes("application")) {
        structure.has_apply_button = true
      }
    })

    // Check for application forms
    forms.forEach((form) => {
      const formText = form.textContent.toLowerCase()
      if (
        formText.includes("application") ||
        formText.includes("resume") ||
        formText.includes("cv")
      ) {
        structure.has_application_form = true
      }
    })

    // Check for JobPosting structured data
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )
    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent)
        if (data["@type"] === "JobPosting") {
          structure.has_job_schema = true
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    })

    return structure
  }

  // Analyze URL for job indicators
  analyzeURL() {
    const url = window.location.href.toLowerCase()
    const path = window.location.pathname.toLowerCase()

    const signals = {
      has_job_keywords: false,
      has_id_patterns: false,
      domain_type: "unknown",
    }

    // Check for job-related keywords in URL
    const url_keywords = [
      "job",
      "career",
      "position",
      "opening",
      "vacancy",
      "apply",
    ]
    signals.has_job_keywords = url_keywords.some(
      (keyword) => url.includes(keyword) || path.includes(keyword)
    )

    // Check for job ID patterns (numbers in path)
    const idPattern = /\d{4,}/
    signals.has_id_patterns = idPattern.test(path)

    // Identify domain type
    if (url.includes("linkedin.com")) signals.domain_type = "linkedin"
    else if (url.includes("indeed.com")) signals.domain_type = "indeed"
    else if (url.includes("glassdoor.com")) signals.domain_type = "glassdoor"
    else if (url.includes("monster.com")) signals.domain_type = "monster"
    else if (url.includes("ziprecruiter.com"))
      signals.domain_type = "ziprecruiter"
    else signals.domain_type = "other"

    return signals
  }

  // Calculate overall confidence score
  calculateConfidence(signals) {
    let confidence = 0

    // Text signals (40% weight)
    const textScore = Math.min(signals.text.keyword_density * 100, 40)
    confidence += textScore

    // Structure signals (30% weight)
    let structureScore = 0
    if (signals.structure.has_apply_button) structureScore += 10
    if (signals.structure.has_application_form) structureScore += 10
    if (signals.structure.has_job_schema) structureScore += 10
    confidence += structureScore

    // URL signals (20% weight)
    let urlScore = 0
    if (signals.url.has_job_keywords) urlScore += 10
    if (signals.url.has_id_patterns) urlScore += 5
    if (signals.url.domain_type !== "other") urlScore += 5
    confidence += urlScore

    // Bonus for known job platforms (10% weight)
    if (
      ["linkedin", "indeed", "glassdoor", "monster", "ziprecruiter"].includes(
        signals.url.domain_type
      )
    ) {
      confidence += 10
    }

    return Math.min(confidence, 100)
  }

  // Extract job data using AI approach
  extractJobData() {
    const analysis = this.analyzePage()

    if (!analysis.isJobPage) {
      return null
    }

    const jobData = {
      title: this.extractTitle(),
      company: this.extractCompany(),
      location: this.extractLocation(),
      description: this.extractDescription(),
      requirements: this.extractRequirements(),
      url: window.location.href,
      extractedAt: new Date().toISOString(),
      confidence: analysis.confidence,
      detectionMethod: "ai",
    }

    return jobData
  }

  // Smart title extraction
  extractTitle() {
    // Try multiple approaches
    const candidates = []

    // 1. Look for structured data
    const jobSchema = this.findJobSchema()
    if (jobSchema && jobSchema.title) {
      candidates.push({ text: jobSchema.title, confidence: 0.9 })
    }

    // 2. Look for common title selectors
    JOB_SELECTORS.titles.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          const text = element.textContent?.trim()
          if (text && this.looksLikeJobTitle(text)) {
            candidates.push({ text, confidence: 0.7 })
          }
        })
      } catch (e) {
        // Ignore selector errors
      }
    })

    // 3. Look at page title
    const pageTitle = document.title.trim()
    if (this.looksLikeJobTitle(pageTitle)) {
      candidates.push({ text: pageTitle, confidence: 0.5 })
    }

    // Return the best candidate
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.confidence - a.confidence)
      return candidates[0].text
    }

    return null
  }

  // Check if text looks like a job title
  looksLikeJobTitle(text) {
    if (!text || text.length < 3 || text.length > 100) return false

    const lowerText = text.toLowerCase()

    // Must contain at least one job keyword
    const hasJobKeyword = JOB_KEYWORDS.titles.some((keyword) =>
      lowerText.includes(keyword)
    )

    // Should not contain too many non-job words
    const nonJobWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
    ]
    const words = lowerText.split(/\s+/)
    const nonJobRatio =
      words.filter((word) => !nonJobWords.includes(word)).length / words.length

    return hasJobKeyword && nonJobRatio > 0.3
  }

  // Find JobPosting structured data
  findJobSchema() {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )

    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent)
        if (Array.isArray(data)) {
          return data.find((item) => item["@type"] === "JobPosting")
        } else if (data["@type"] === "JobPosting") {
          return data
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    return null
  }

  // Extract company information
  extractCompany() {
    // Try structured data first
    const jobSchema = this.findJobSchema()
    if (jobSchema && jobSchema.hiringOrganization?.name) {
      return jobSchema.hiringOrganization.name
    }

    // Look for company selectors
    for (const selector of JOB_SELECTORS.companies) {
      try {
        const elements = document.querySelectorAll(selector)
        for (const element of elements) {
          const text = element.textContent?.trim()
          if (
            text &&
            text.length > 2 &&
            text.length < 100 &&
            !this.looksLikeJobTitle(text)
          ) {
            return text
          }
        }
      } catch (e) {
        // Ignore selector errors
      }
    }

    return null
  }

  // Extract location information
  extractLocation() {
    // Try structured data first
    const jobSchema = this.findJobSchema()
    if (jobSchema && jobSchema.jobLocation) {
      return typeof jobSchema.jobLocation === "string"
        ? jobSchema.jobLocation
        : jobSchema.jobLocation?.address?.addressLocality || null
    }

    // Look for location selectors
    for (const selector of JOB_SELECTORS.locations) {
      try {
        const elements = document.querySelectorAll(selector)
        for (const element of elements) {
          const text = element.textContent?.trim()
          if (text && this.looksLikeLocation(text)) {
            return text
          }
        }
      } catch (e) {
        // Ignore selector errors
      }
    }

    return null
  }

  // Check if text looks like a location
  looksLikeLocation(text) {
    if (!text || text.length < 2 || text.length > 100) return false

    const locationIndicators = [
      ",",
      " - ",
      " ",
      "State",
      "Province",
      "CA",
      "NY",
      "TX",
      "FL",
      "IL",
      "WA",
      "Remote",
      "Hybrid",
      "On-site",
      "United States",
      "USA",
      "Canada",
      "UK",
    ]

    const lowerText = text.toLowerCase()
    return locationIndicators.some((indicator) =>
      lowerText.includes(indicator.toLowerCase())
    )
  }

  // Extract job description
  extractDescription() {
    // Try structured data first
    const jobSchema = this.findJobSchema()
    if (jobSchema && jobSchema.description) {
      return jobSchema.description
    }

    // Look for description selectors
    for (const selector of JOB_SELECTORS.descriptions) {
      try {
        const elements = document.querySelectorAll(selector)
        for (const element of elements) {
          const text = element.textContent?.trim()
          if (text && text.length > 50 && this.looksLikeJobDescription(text)) {
            return text.substring(0, 1000) // Limit length
          }
        }
      } catch (e) {
        // Ignore selector errors
      }
    }

    return null
  }

  // Check if text looks like a job description
  looksLikeJobDescription(text) {
    if (!text || text.length < 50) return false

    const lowerText = text.toLowerCase()
    const descriptionSignals = JOB_KEYWORDS.requirements.concat(
      JOB_KEYWORDS.benefits
    )

    const signalCount = descriptionSignals.filter((signal) =>
      lowerText.includes(signal.toLowerCase())
    ).length

    return signalCount >= 2
  }

  // Extract requirements
  extractRequirements() {
    const description = this.extractDescription()
    if (!description) return null

    // Look for requirement patterns
    const requirements = []

    // Look for bullet points or numbered lists
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = description

    const listItems = tempDiv.querySelectorAll("li, p")
    listItems.forEach((item) => {
      const text = item.textContent?.trim()
      if (text && text.length < 200 && this.looksLikeRequirement(text)) {
        requirements.push(text)
      }
    })

    return requirements.length > 0 ? requirements : null
  }

  // Check if text looks like a requirement
  looksLikeRequirement(text) {
    if (!text || text.length < 5) return false

    const requirementIndicators = [
      "experience",
      "years",
      "skill",
      "ability",
      "knowledge",
      "degree",
      "required",
      "must have",
      "should have",
      "preferred",
      "bonus",
    ]

    const lowerText = text.toLowerCase()
    return requirementIndicators.some((indicator) =>
      lowerText.includes(indicator)
    )
  }
}

// Global detector instance
const aiDetector = new AIJobDetector()

// Enhanced extraction function that combines platform-specific and AI detection
function extractJobData() {
  const url = window.location.href
  let jobData = null

  // First try platform-specific detection for known platforms
  if (url.includes("linkedin.com/jobs")) {
    jobData = extractFromPatterns(jobPatterns.linkedin)
  } else if (url.includes("indeed.com")) {
    jobData = extractFromPatterns(jobPatterns.indeed)
  } else if (url.includes("glassdoor.com")) {
    jobData = extractFromPatterns(jobPatterns.glassdoor)
  }

  // If no platform-specific data found, try AI detection
  if (!jobData || !jobData.title) {
    jobData = aiDetector.extractJobData()
  }

  if (jobData && jobData.title) {
    jobData.url = url
    jobData.extractedAt = new Date().toISOString()

    // Send to background script
    chrome.runtime.sendMessage({
      action: "extractJob",
      data: jobData,
    } satisfies ExtensionRequest)

    // Update popup if open
    chrome.runtime.sendMessage({
      action: "updatePopup",
      data: jobData,
    } satisfies ExtensionRequest)
  }

  return jobData
}

// Extract data using CSS selectors (for known platforms)
function extractFromPatterns(patterns: Record<string, string[]>) {
  const data: Record<string, string | null> = {}

  Object.keys(patterns).forEach((key) => {
    const selectors = patterns[key]
    let value = null

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        value = element.textContent?.trim()
        break
      }
    }

    data[key] = value
  })

  return data
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "detectJob") {
    const jobData = extractJobData()
    sendResponse({ success: true, job: jobData })
  }
  return true
})

// Auto-extract when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", extractJobData)
} else {
  extractJobData()
}

// Observe page changes for single-page applications
const observer = new MutationObserver(() => {
  setTimeout(extractJobData, 1000) // Debounce
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

// Add floating action button with AI detection
function addFloatingButton() {
  // Remove existing button
  const existing = document.getElementById("smartapply-float-btn")
  if (existing) {
    existing.remove()
  }

  // Analyze page first
  const analysis = aiDetector.analyzePage()

  // Create button with AI indicator
  const button = document.createElement("div")
  button.id = "smartapply-float-btn"

  const aiIndicator = analysis.isJobPage ? "🤖" : "🔍"
  const buttonColor = analysis.isJobPage ? "#10b981" : "#3b82f6"

  button.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: ${buttonColor};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
    ">
      ${aiIndicator} SwiftApplyHQ
    </div>
  `

  button.addEventListener("click", () => {
    const jobData = extractJobData()
    if (jobData) {
      // Open popup or navigate to dashboard
      chrome.runtime.sendMessage({
        action: "openDashboard",
        data: jobData,
      } satisfies ExtensionRequest)
    } else {
      // Show detection status
      chrome.runtime.sendMessage({
        action: "showDetectionStatus",
        data: analysis,
      } satisfies ExtensionRequest)
    }
  })

  // Add hover effect
  button.addEventListener("mouseenter", () => {
    button.querySelector("div").style.transform = "scale(1.05)"
  })

  button.addEventListener("mouseleave", () => {
    button.querySelector("div").style.transform = "scale(1)"
  })

  document.body.appendChild(button)
}

// Add floating button after page loads
setTimeout(addFloatingButton, 2000)

// Re-analyze on page changes
observer.addEventListener("callback", () => {
  setTimeout(addFloatingButton, 2000)
})

export {}
