"use client"

import { useAppToast } from "@/src/components/AppToastProvider"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Header } from "@workspace/ui/components/header"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Clock } from "lucide-react"

export default function SupportPage() {
  const { showToast } = useAppToast()

  const handleSubmit = async () => {
    const data = {
      name: (document.getElementById("name") as HTMLInputElement).value,
      email: (document.getElementById("email") as HTMLInputElement).value,
      subject: (document.getElementById("subject") as HTMLInputElement).value,
      category: (document.getElementById("category") as HTMLSelectElement)
        .value,
      message: (document.getElementById("message") as HTMLTextAreaElement)
        .value,
    }

    try {
      const response = await fetch("http://localhost:3001/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        showToast({
          variant: "success",
          title: "Contact form submitted successfully!",
          description: "We will get back to you soon.",
        })
        // Clear form
        ;(document.getElementById("name") as HTMLInputElement).value = ""
        ;(document.getElementById("email") as HTMLInputElement).value = ""
        ;(document.getElementById("subject") as HTMLInputElement).value = ""
        ;(document.getElementById("category") as HTMLSelectElement).value = ""
        ;(document.getElementById("message") as HTMLTextAreaElement).value = ""
      } else {
        showToast({
          variant: "error",
          title: "Error submitting form",
          description: "Please try again.",
        })
      }
    } catch (error) {
      showToast({
        variant: "error",
        title: "Error submitting form",
        description: "Please try again.",
      })
    }
  }

  return (
    <div>
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Contact Support
            </h1>
            <p className="text-lg text-muted-foreground">
              We're here to help you make the most of SwiftApplyHQ
            </p>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <form className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Credits</option>
                        <option value="account">Account Help</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        placeholder="Tell us more about your question or issue..."
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleSubmit}
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">Email Support</h3>
                  <p className="text-muted-foreground">
                    24/7 - Response within 24 hours
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Live Chat</h3>
                  <p className="text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
