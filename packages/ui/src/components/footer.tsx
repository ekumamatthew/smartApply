import { Github, Linkedin, Mail, Twitter } from "lucide-react"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface FooterProps {
  className?: string
}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn("flex w-full items-center justify-center border-t bg-background", className)}
        {...props}
      >
        <div className="container px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="flex flex-col items-start space-y-4">
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-primary-foreground">
                  SA
                </div>
                <span className="text-xl font-bold">SwiftApplyHQ</span>
              </div>
              <p className="mb-4 max-w-md text-muted-foreground">
                The intelligent job application platform that helps you land
                your dream job faster. Automate, optimize, and manage your
                entire job search lifecycle.
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </Button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row md:gap-0">
            <p className="text-sm text-muted-foreground">
              © 2024 SwiftApplyHQ. All rights reserved.
            </p>
            <div className="flex flex-col items-center gap-6 md:flex-row md:gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }
)
Footer.displayName = "Footer"

export { Footer }
