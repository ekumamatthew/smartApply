"use client"

import { Button } from "@workspace/ui/components/button"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"
import * as React from "react"

type ToastVariant = "success" | "error" | "info"

type AppToast = {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastContextValue = {
  showToast: (toast: Omit<AppToast, "id">) => string
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function variantClasses(variant: ToastVariant) {
  if (variant === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900"
  }
  if (variant === "error") {
    return "border-red-200 bg-red-50 text-red-900"
  }
  return "border-blue-200 bg-blue-50 text-blue-900"
}

function VariantIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <CheckCircle2 className="h-4 w-4 shrink-0" />
  }
  if (variant === "error") {
    return <XCircle className="h-4 w-4 shrink-0" />
  }
  return <Info className="h-4 w-4 shrink-0" />
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<AppToast[]>([])
  const timersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  )

  const dismissToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
    const timer = timersRef.current[id]
    if (timer) {
      clearTimeout(timer)
      delete timersRef.current[id]
    }
  }, [])

  const showToast = React.useCallback(
    (toast: Omit<AppToast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const next: AppToast = { id, ...toast }
      setToasts((current) => [next, ...current].slice(0, 5))

      const duration = Math.max(1200, toast.durationMs ?? 4200)
      timersRef.current[id] = setTimeout(() => {
        dismissToast(id)
      }, duration)

      return id
    },
    [dismissToast]
  )

  React.useEffect(() => {
    return () => {
      for (const timer of Object.values(timersRef.current)) {
        clearTimeout(timer)
      }
      timersRef.current = {}
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => {
          const variant = toast.variant ?? "info"
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-lg border p-3 shadow-lg backdrop-blur ${variantClasses(
                variant
              )}`}
            >
              <div className="flex items-start gap-2">
                <VariantIcon variant={variant} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-0.5 text-xs opacity-90">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dismissToast(toast.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useAppToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useAppToast must be used within AppToastProvider")
  }
  return context
}
