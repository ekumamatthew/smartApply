"use client"

import { Button } from "@workspace/ui/components/button"
import { CreditCard, Sparkles } from "lucide-react"

type UpgradePricingModalProps = {
  open: boolean
  onClose: () => void
}

export function UpgradePricingModal({ open, onClose }: UpgradePricingModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Upgrade / Pricing</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Your free trial is exhausted. Upgrade to keep generating emails and CV
          optimizations.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Starter Pack</p>
            <p className="text-lg font-bold">$10</p>
            <p className="text-xs text-muted-foreground">1000 credits</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Min Purchase</p>
            <p className="text-lg font-bold">$1</p>
            <p className="text-xs text-muted-foreground">100 credits</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Usage Based</p>
            <p className="text-lg font-bold">Pay per task</p>
            <p className="text-xs text-muted-foreground">Credits deducted by action</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border bg-muted/20 p-3 text-sm">
          <p className="font-medium">Current model</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>4 free email generations</li>
            <li>4 free CV optimizations</li>
            <li>After trial, credits are charged per task</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button type="button" asChild onClick={onClose}>
            <a href="/dashboard/settings?tab=account#billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade Now
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
