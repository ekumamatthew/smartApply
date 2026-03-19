import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Menu } from "lucide-react"
import * as React from "react"

interface HeaderProps {
  className?: string
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 flex w-full justify-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
          className
        )}
        {...props}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                SA
              </div>
              <span className="text-xl font-bold">SmartApply</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            <a
              href="/how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              How it Works
            </a>
            <a
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Testimonials
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              asChild
            >
              <a href="/signin">Sign In</a>
            </Button>
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <a href="/signup">Get Started</a>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <nav className="container space-y-2 px-4 py-4">
              <a
                href="/how-it-works"
                className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </a>
              <a
                href="/pricing"
                className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <div className="space-y-2 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/signin">Sign In</a>
                </Button>
                <Button size="sm" className="w-full justify-start" asChild>
                  <a href="/signup">Get Started</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    )
  }
)
Header.displayName = "Header"

export { Header }
