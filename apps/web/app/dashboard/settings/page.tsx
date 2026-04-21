"use client"

import { useAppToast } from "@/src/components/AppToastProvider"
import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import {
  confirmCreditCheckout,
  createCreditCheckout,
  fetchBillingSummary,
} from "@/src/lib/billing-api"
import {
  fetchSettings,
  updateNotificationSettings,
  updateProfileSettings,
  type UserNotificationSettings,
  type UserProfileSettings,
} from "@/src/lib/dashboard-api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
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
import Link from "next/link"
import * as React from "react"

const defaultProfile: UserProfileSettings = {
  fullName: "",
  email: "",
  phone: "",
  linkedin: "",
  professionalSummary: "",
}

const defaultNotifications: UserNotificationSettings = {
  emailNotifications: true,
  applicationUpdates: true,
  interviewReminders: true,
  followUpReminders: false,
  weeklyReports: false,
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { showToast } = useAppToast()
  const [activeTab, setActiveTab] = React.useState("profile")
  const [profile, setProfile] =
    React.useState<UserProfileSettings>(defaultProfile)
  const [notifications, setNotifications] =
    React.useState<UserNotificationSettings>(defaultNotifications)
  const [purchaseUsd, setPurchaseUsd] = React.useState("1000")
  const [selectedCurrency, setSelectedCurrency] = React.useState("USD")
  const [saveMessage, setSaveMessage] = React.useState("")

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  })

  const billingQuery = useQuery({
    queryKey: ["billing-summary"],
    queryFn: fetchBillingSummary,
  })

  React.useEffect(() => {
    if (!settingsQuery.data) return
    setProfile(settingsQuery.data.profile)
    setNotifications(settingsQuery.data.notifications)
  }, [settingsQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const [savedProfile, savedNotifications] = await Promise.all([
        updateProfileSettings({
          fullName: profile.fullName,
          phone: profile.phone,
          linkedin: profile.linkedin,
          professionalSummary: profile.professionalSummary,
        }),
        updateNotificationSettings(notifications),
      ])
      return { savedProfile, savedNotifications }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] })
      setSaveMessage("Changes saved successfully")
      showToast({
        variant: "success",
        title: "Settings updated",
        description: "Profile and notifications have been saved.",
      })
      setTimeout(() => setSaveMessage(""), 2500)
    },
    onError: (error: unknown) => {
      showToast({
        variant: "error",
        title: "Could not save settings",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const credits = Number(purchaseUsd)
      if (!Number.isFinite(credits) || credits < 1000) {
        throw new Error("Minimum purchase is 1000 credits")
      }
      return createCreditCheckout({
        credits,
        currency: selectedCurrency,
      })
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
    onError: (error: unknown) => {
      showToast({
        variant: "error",
        title: "Unable to start checkout",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async (input: {
      orderId: string
      transactionId: string
      txRef?: string
    }) =>
      confirmCreditCheckout(input.orderId, input.transactionId, input.txRef),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["billing-summary"] })
      showToast({
        variant: "success",
        title: "Payment successful",
        description: "Credits added to your wallet.",
      })
    },
    onError: (error: unknown) => {
      showToast({
        variant: "error",
        title: "Payment confirmation failed",
        description:
          error instanceof Error ? error.message : "Please contact support.",
      })
    },
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const tab = url.searchParams.get("tab")
    if (tab === "profile" || tab === "notifications" || tab === "account") {
      setActiveTab(tab)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const transactionId = url.searchParams.get("transaction_id")
    const txRef = url.searchParams.get("tx_ref")
    const orderId = url.searchParams.get("order_id")
    const status = url.searchParams.get("billing")

    if (status === "cancelled") {
      showToast({
        variant: "info",
        title: "Checkout cancelled",
        description: "No charges were made.",
      })
      return
    }

    if (!transactionId || !orderId || confirmMutation.isPending) return
    confirmMutation.mutate({
      orderId,
      transactionId,
      txRef: txRef ?? undefined,
    })
    url.searchParams.delete("transaction_id")
    url.searchParams.delete("tx_ref")
    url.searchParams.delete("order_id")
    window.history.replaceState({}, "", url.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProfileChange = (
    field: keyof UserProfileSettings,
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (
    field: keyof UserNotificationSettings,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Settings },
  ]

  return (
    <AuthenticatedDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile and application preferences
            </p>
          </div>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {saveMessage && (
          <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">{saveMessage}</span>
          </div>
        )}

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
                    value={profile.fullName}
                    onChange={(e) =>
                      handleProfileChange("fullName", e.target.value)
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
                    disabled
                    className="cursor-not-allowed opacity-70"
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
                  value={profile.professionalSummary}
                  onChange={(e) =>
                    handleProfileChange("professionalSummary", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">
                Email Notifications
              </h2>
              <div className="space-y-4">
                {[
                  {
                    key: "emailNotifications",
                    title: "Email Notifications",
                    description:
                      "Receive email updates about your applications",
                    icon: Mail,
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                  },
                  {
                    key: "applicationUpdates",
                    title: "Application Updates",
                    description: "Get notified when application status changes",
                    icon: FileText,
                    color: "text-green-600",
                    bg: "bg-green-100",
                  },
                  {
                    key: "interviewReminders",
                    title: "Interview Reminders",
                    description: "Receive reminders for upcoming interviews",
                    icon: Calendar,
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                  },
                  {
                    key: "followUpReminders",
                    title: "Follow-up Reminders",
                    description: "Get reminded when follow-ups are needed",
                    icon: Bell,
                    color: "text-orange-600",
                    bg: "bg-orange-100",
                  },
                  {
                    key: "weeklyReports",
                    title: "Weekly Reports",
                    description:
                      "Receive weekly summary of your job search activity",
                    icon: Briefcase,
                    color: "text-indigo-600",
                    bg: "bg-indigo-100",
                  },
                ].map((item) => {
                  const Icon = item.icon
                  const value =
                    notifications[item.key as keyof UserNotificationSettings]
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}
                        >
                          <Icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleNotificationChange(
                            item.key as keyof UserNotificationSettings,
                            !value
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Account Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Forgot Password</p>
                    <p className="text-sm text-muted-foreground">
                      Request a password reset link by email
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/auth/forgot-password">Reset Password</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div id="billing" className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Billing & Credits</h2>
              <p className="text-sm text-muted-foreground">
                Free
                {/* Free trial: 2 email generations and no CV optimizations. Upgrade
                to keep going with credits. */}
              </p>

              {/* <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    Credit Balance
                  </p>
                  <p className="text-2xl font-bold">
                    {billingQuery.data?.credits.balance ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    Email Cost (after trial)
                  </p>
                  <p className="text-2xl font-bold">
                    {billingQuery.data?.rates.generate ?? 25}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    CV Optimize Cost (after trial)
                  </p>
                  <p className="text-2xl font-bold">
                    {billingQuery.data?.rates.parse ?? 40}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="w-full md:w-64">
                    <Label htmlFor="purchase-confirm" className="text-sm">
                      Add credits and select currency ({selectedCurrency}){" "}
                      <br />
                      <i className="text-xs">Min 1000 credits</i>
                    </Label>
                    <div className="relative w-full">
                      <select
                        id="currency"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="absolute top-1 right-1 flex h-8 max-w-[75px] rounded-md border border-none border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="GHS">GHS - Ghanaian Cedi</option>
                      </select>
                      <Input
                        id="purchase-confirm"
                        type="number"
                        min={1000}
                        step={1}
                        value={purchaseUsd}
                        onChange={(event) => setPurchaseUsd(event.target.value)}
                        placeholder={
                          selectedCurrency === "USD"
                            ? "Amount in USD"
                            : "Amount in " + selectedCurrency
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? "Redirecting..." : "Checkout"}
                  </Button>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedDashboardLayout>
  )
}
