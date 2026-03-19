"use client"

import { Button } from "@workspace/ui/components/button"
import { DashboardLayout } from "@workspace/ui/components/dashboard-layout"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  FileText,
  Mail,
  Save,
  Settings,
  User,
} from "lucide-react"
import * as React from "react"

interface ProfileData {
  name: string
  email: string
  phone: string
  linkedin: string
}

interface NotificationPreferences {
  emailNotifications: boolean
  applicationUpdates: boolean
  interviewReminders: boolean
  followUpReminders: boolean
  weeklyReports: boolean
}

const defaultProfile: ProfileData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  linkedin: "https://linkedin.com/in/johndoe",
}

const defaultNotifications: NotificationPreferences = {
  emailNotifications: true,
  applicationUpdates: true,
  interviewReminders: true,
  followUpReminders: false,
  weeklyReports: false,
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile")
  const [profile, setProfile] = React.useState<ProfileData>(defaultProfile)
  const [notifications, setNotifications] =
    React.useState<NotificationPreferences>(defaultNotifications)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveMessage, setSaveMessage] = React.useState("")

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNotificationChange = (
    field: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setSaveMessage("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setSaveMessage("Changes saved successfully!")

    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Settings },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile and application preferences
            </p>
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">{saveMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      handleProfileChange("name", e.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={(e) =>
                      handleProfileChange("linkedin", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">
                Professional Summary
              </h2>
              <div className="space-y-2">
                <Label htmlFor="summary">About You</Label>
                <textarea
                  id="summary"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
                  placeholder="Brief professional summary for your applications..."
                  defaultValue="Experienced software developer with expertise in frontend technologies and a passion for creating user-friendly applications."
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">
                Email Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your applications
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange(
                        "emailNotifications",
                        !notifications.emailNotifications
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.emailNotifications
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.emailNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Application Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when application status changes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange(
                        "applicationUpdates",
                        !notifications.applicationUpdates
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.applicationUpdates
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.applicationUpdates
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Interview Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders for upcoming interviews
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange(
                        "interviewReminders",
                        !notifications.interviewReminders
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.interviewReminders
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.interviewReminders
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                      <Bell className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Follow-up Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded when follow-ups are needed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange(
                        "followUpReminders",
                        !notifications.followUpReminders
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.followUpReminders
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.followUpReminders
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summary of your job search activity
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange(
                        "weeklyReports",
                        !notifications.weeklyReports
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.weeklyReports ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.weeklyReports
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Account Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="flex h-auto items-center justify-start p-4"
              asChild
            >
              <a href="/dashboard/cv">
                <FileText className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Manage CVs</p>
                  <p className="text-xs text-muted-foreground">
                    Update your CV documents
                  </p>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto items-center justify-start p-4"
              asChild
            >
              <a href="/dashboard/applications">
                <Briefcase className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">View Applications</p>
                  <p className="text-xs text-muted-foreground">
                    Track your job applications
                  </p>
                </div>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
