import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Briefcase, Copy, FileText, Mail, Sparkles, User } from "lucide-react"
import * as React from "react"

const EmailGenerator = React.forwardRef<HTMLDivElement, {}>(
  ({ ...props }, ref) => {
    const [jobDescription, setJobDescription] = React.useState("")
    const [userDetails, setUserDetails] = React.useState("")
    const [generatedEmail, setGeneratedEmail] = React.useState("")
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [copied, setCopied] = React.useState(false)

    const handleGenerateEmail = async () => {
      if (!jobDescription.trim()) return

      setIsGenerating(true)
      setGeneratedEmail("")

      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate sample email based on job description
      const sampleEmail = `Dear Hiring Manager,

I hope this message finds you well. I am writing to express my strong interest in the position I discovered recently. After carefully reviewing the job description, I am confident that my skills and experience align perfectly with your requirements.

${jobDescription.length > 100 ? "The opportunity to work with your team particularly excites me, as I believe my background in relevant technologies and my passion for innovation would allow me to contribute meaningfully to your projects." : "This role represents an exciting opportunity for me to apply my skills and grow professionally within a dynamic environment."}

I would welcome the chance to discuss how my background, skills, and enthusiasm would benefit your team. Thank you for considering my application.

Best regards,
[Your Name]`

      setGeneratedEmail(sampleEmail)
      setIsGenerating(false)
    }

    const handleCopyEmail = async () => {
      await navigator.clipboard.writeText(generatedEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <section
        ref={ref}
        className="relative flex w-full items-center justify-center overflow-hidden bg-background py-20 lg:py-32"
        {...props}
      >
        {/* Animated Background */}
        <div
          className="absolute inset-0 animate-pulse bg-primary/3"
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        ></div>
        <div
          className="absolute inset-0 animate-pulse bg-secondary/2"
          style={{ animationDuration: "12s", animationDelay: "8s" }}
        ></div>

        <div className="relative container px-4">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Free email generator
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Stop Staring at a Blank
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Application Email
              </span>
            </h2>
            <p className="mx-auto max-w-2xl rounded-lg bg-background/20 p-4 text-xl text-muted-foreground backdrop-blur-sm">
              Paste a job description and get a strong first draft in seconds.
              Edit, personalize, and send with confidence.
            </p>
          </div>

          {/* Email Generator Interface */}
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border/20 bg-background/30 p-8 backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Input Section */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="job-desc" className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Job Description
                    </Label>
                    <textarea
                      id="job-desc"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-details" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Your Details (Optional)
                    </Label>
                    <Input
                      id="user-details"
                      value={userDetails}
                      onChange={(e) => setUserDetails(e.target.value)}
                      placeholder="Your name, experience, etc."
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateEmail}
                    disabled={!jobDescription.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Generate Email
                      </>
                    )}
                  </Button>
                </div>

                {/* Output Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Generated Email
                    </Label>
                    {generatedEmail && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyEmail}
                        className="border-primary/20 text-primary hover:bg-primary/10"
                      >
                        {copied ? (
                          <>
                            <span className="mr-2 text-sm">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="relative min-h-[300px] rounded-lg border border-border/20 bg-background/50 p-4">
                    {isGenerating ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <p className="text-sm text-muted-foreground">
                            Writing your tailored email...
                          </p>
                        </div>
                      </div>
                    ) : generatedEmail ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {generatedEmail}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-center">
                        <div className="text-muted-foreground">
                          <Mail className="mx-auto mb-4 h-12 w-12 opacity-50" />
                          <p className="text-sm">
                            Your generated email will appear here
                          </p>
                          <p className="mt-2 text-xs">
                            Paste a job description and generate your first
                            draft
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-8 border-t border-border/20 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Quick Tips
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border/10 bg-background/20 p-3">
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-foreground">
                        ✓ Be Specific:
                      </span>{" "}
                      Include key requirements from the job description
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/10 bg-background/20 p-3">
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-foreground">
                        ✓ Add Context:
                      </span>{" "}
                      Include your relevant experience for better results
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/10 bg-background/20 p-3">
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-foreground">
                        ✓ Customize:
                      </span>{" "}
                      Edit the generated email to add your personal touch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm text-primary backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Want full CV tailoring and tracking too?
              <a
                href="/auth/signup"
                className="ml-2 font-medium underline hover:text-primary/80"
              >
                Create a free account
              </a>
            </div>
          </div>

          {/* Floating Elements */}
          <div
            className="absolute top-10 right-10 h-16 w-16 animate-pulse rounded-full bg-primary/8 blur-3xl"
            style={{ animationDuration: "7s", animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-10 left-10 h-20 w-20 animate-pulse rounded-full bg-secondary/6 blur-3xl"
            style={{ animationDuration: "9s", animationDelay: "5s" }}
          ></div>
        </div>
      </section>
    )
  }
)
EmailGenerator.displayName = "EmailGenerator"

export { EmailGenerator }
