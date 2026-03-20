"use client"

import { Button } from "@workspace/ui/components/button"
import { DashboardLayout } from "@workspace/ui/components/dashboard-layout"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Briefcase,
  CheckCircle,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Settings,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import * as React from "react"

interface CV {
  id: string
  name: string
  uploadDate: string
  size: string
  isDefault: boolean
  content?: string
}

const mockCVs: CV[] = [
  {
    id: "1",
    name: "Software Engineer CV.pdf",
    uploadDate: "2024-03-10",
    size: "245 KB",
    isDefault: true,
  },
  {
    id: "2",
    name: "Frontend Developer CV.pdf",
    uploadDate: "2024-03-05",
    size: "198 KB",
    isDefault: false,
  },
  {
    id: "3",
    name: "Full Stack Developer CV.docx",
    uploadDate: "2024-02-28",
    size: "312 KB",
    isDefault: false,
  },
]

export default function CVManagementPage() {
  const [cvs, setCvs] = React.useState<CV[]>(mockCVs)
  const [selectedCV, setSelectedCV] = React.useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = React.useState(false)
  const [showPreviewModal, setShowPreviewModal] = React.useState(false)
  const [previewCV, setPreviewCV] = React.useState<CV | null>(null)

  const handleSetDefault = (cvId: string) => {
    setCvs((prev) =>
      prev.map((cv) => ({
        ...cv,
        isDefault: cv.id === cvId,
      }))
    )
    if (selectedCV === cvId) {
      setSelectedCV(cvId)
    } else {
      setSelectedCV(cvId)
    }
  }

  const handleDeleteCV = (cvId: string) => {
    setCvs((prev) => prev.filter((cv) => cv.id !== cvId))
    if (selectedCV === cvId) {
      setSelectedCV(null)
    }
  }

  const handleUploadCV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newCV: CV = {
        id: Date.now().toString(),
        name: file.name || "Untitled CV",
        uploadDate: new Date().toISOString().split("T")[0] ?? "",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        isDefault: cvs.length === 0,
      }
      setCvs((prev) => [...prev, newCV])
      setShowUploadModal(false)
    }
  }

  const handlePreviewCV = (cv: CV) => {
    setPreviewCV(cv)
    setShowPreviewModal(true)
  }

  const defaultCV = cvs.find((cv) => cv.isDefault)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CV Management</h1>
            <p className="text-muted-foreground">
              Upload, preview, and manage your CVs for job applications
            </p>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload New CV
          </Button>
        </div>

        {/* Default CV Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Default CV</h2>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          {defaultCV ? (
            <div className="flex items-start space-x-4 rounded-lg border bg-muted/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{defaultCV.name}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      Default
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Uploaded {defaultCV.uploadDate} • {defaultCV.size}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewCV(defaultCV)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No default CV set</p>
              <p className="text-sm text-muted-foreground">
                Upload a CV to set it as your default
              </p>
            </div>
          )}
        </div>

        {/* All CVs List */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All CVs ({cvs.length})</h2>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export All
            </Button>
          </div>

          {cvs.length === 0 ? (
            <div className="py-12 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No CVs uploaded</h3>
              <p className="text-muted-foreground">
                Upload your first CV to get started with applications
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    selectedCV === cv.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="defaultCV"
                      checked={selectedCV === cv.id || cv.isDefault}
                      onChange={() => setSelectedCV(cv.id)}
                      className="h-4 w-4"
                      readOnly
                    />
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{cv.name}</p>
                        <div className="flex items-center space-x-2">
                          {cv.isDefault && (
                            <>
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                Default
                              </span>
                            </>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {cv.uploadDate} • {cv.size}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewCV(cv)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(cv.id)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {cv.isDefault ? "Default" : "Set Default"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCV(cv.id)}
                      className="hover:text-destructive-foreground text-destructive hover:bg-destructive"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="flex h-auto items-center justify-start p-4"
              asChild
            >
              <a href="/dashboard/applications">
                <Briefcase className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Apply with CV</p>
                  <p className="text-xs text-muted-foreground">
                    Use CV in job applications
                  </p>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto items-center justify-start p-4"
              asChild
            >
              <a href="/dashboard">
                <Settings className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">CV Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Configure CV preferences
                  </p>
                </div>
              </a>
            </Button>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Upload New CV</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cv-upload">Choose CV File</Label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUploadCV}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && previewCV && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  CV Preview: {previewCV.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 h-16 w-16" />
                  <p>CV preview would appear here</p>
                  <p className="text-sm text-muted-foreground">
                    This would integrate with a PDF viewer or document preview
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
