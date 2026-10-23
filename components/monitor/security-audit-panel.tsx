"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react"
import { Panel } from "./panel"

interface AuditItem {
  label: string
  detail: string
  status: "pass" | "warn" | "fail"
}

const statusStyles = {
  pass: "border-primary/40 bg-primary/10 text-primary",
  warn: "border-accent/50 bg-accent/10 text-accent-foreground",
  fail: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function SecurityAuditPanel() {
  const [items, setItems] = useState<AuditItem[]>([])
  const [scanning, setScanning] = useState(false)
  const [scannedAt, setScannedAt] = useState<number | null>(null)

  const scan = useCallback(async () => {
    setScanning(true)
    const next: AuditItem[] = []
    const secure = typeof window !== "undefined" && window.isSecureContext
    next.push({
      label: "Secure context",
      detail: secure ? "HTTPS or localhost is active." : "This page is not running in a secure context.",
      status: secure ? "pass" : "fail",
    })

    const https = typeof location !== "undefined" && location.protocol === "https:"
    next.push({
      label: "Transport encryption",
      detail: https ? "Traffic is protected by HTTPS." : "Use HTTPS before entering sensitive information.",
      status: https || location.hostname === "localhost" ? "pass" : "fail",
    })

    const storage = typeof navigator !== "undefined" && "storage" in navigator
    next.push({
      label: "Storage API",
      detail: storage ? "The browser exposes quota-managed storage." : "Storage capability is unavailable.",
      status: storage ? "pass" : "warn",
    })

    const cookiesEnabled = typeof navigator !== "undefined" && navigator.cookieEnabled
    next.push({
      label: "Cookies",
      detail: cookiesEnabled ? "Cookies are enabled; review site permissions regularly." : "Cookies are disabled in this browser.",
      status: cookiesEnabled ? "warn" : "pass",
    })

    if (typeof fetch === "function" && typeof location !== "undefined") {
      try {
        const response = await fetch(location.href, { method: "HEAD", cache: "no-store", credentials: "same-origin" })
        const csp = response.headers.get("content-security-policy")
        const cspReport = response.headers.get("content-security-policy-report-only")
        const referrer = response.headers.get("referrer-policy")
        next.push({
          label: "Content Security Policy",
          detail: csp ? "An enforcing CSP header is present." : cspReport ? "Only report-only CSP is present; it does not block threats." : "No CSP header was detected.",
          status: csp ? "pass" : cspReport ? "warn" : "fail",
        })
        next.push({
          label: "Referrer policy",
          detail: referrer ? `Policy: ${referrer}` : "No Referrer-Policy header was detected.",
          status: referrer ? "pass" : "warn",
        })
      } catch {
        next.push({ label: "Response headers", detail: "Could not inspect same-origin response headers.", status: "warn" })
      }
    }

    setItems(next)
    setScannedAt(Date.now())
    setScanning(false)
  }, [])

  useEffect(() => { void scan() }, [scan])

  const score = items.length ? Math.round((items.filter((item) => item.status === "pass").length / items.length) * 100) : 0
  const Icon = score >= 80 ? ShieldCheck : score >= 50 ? AlertTriangle : ShieldAlert

  return (
    <Panel title="Security Audit" icon={ShieldCheck} accent="text-primary" action={
      <button type="button" onClick={() => void scan()} disabled={scanning} className="tva-label rounded-sm border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary disabled:opacity-50">
        {scanning ? "Scanning" : "Rescan"}
      </button>
    }>
      <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <p className="font-mono text-2xl font-bold text-foreground">{score}%</p>
          <p className="tva-label text-[10px] text-muted-foreground">Local posture score</p>
        </div>
        {scannedAt && <span className="ml-auto font-mono text-[10px] text-muted-foreground">{new Date(scannedAt).toLocaleTimeString()}</span>}
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const StatusIcon = item.status === "pass" ? CheckCircle2 : item.status === "warn" ? AlertTriangle : ShieldAlert
          return <div key={item.label} className="flex items-start gap-2 rounded-sm border border-border bg-secondary/30 p-2">
            <StatusIcon className={`mt-0.5 h-4 w-4 shrink-0 ${item.status === "pass" ? "text-primary" : item.status === "warn" ? "text-accent-foreground" : "text-destructive"}`} aria-hidden="true" />
            <div className="min-w-0"><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.detail}</p></div>
            <span className={`ml-auto shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase ${statusStyles[item.status]}`}>{item.status}</span>
          </div>
        })}
      </div>
    </Panel>
  )
}
