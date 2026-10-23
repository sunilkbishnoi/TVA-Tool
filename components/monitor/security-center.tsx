"use client"

import { useCallback, useEffect, useState } from "react"
import { Bug, CheckCircle2, Fingerprint, Globe2, LockKeyhole, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react"
import { Panel } from "./panel"

type Status = "pass" | "warn" | "fail"
type Check = { name: string; detail: string; status: Status; icon: typeof LockKeyhole }

function runChecks(): Check[] {
  if (typeof window === "undefined") return []
  const secure = window.isSecureContext
  const https = location.protocol === "https:" || location.hostname === "localhost"
  const cookies = navigator.cookieEnabled
  const storage = "storage" in navigator
  const permissions = "permissions" in navigator
  const fingerprintSignals = [navigator.userAgent, navigator.language, navigator.platform, navigator.hardwareConcurrency].filter(Boolean).length

  return [
    { name: "Secure connection", detail: secure && https ? "HTTPS and a secure browser context are active." : "Use this tool over HTTPS before handling sensitive data.", status: secure && https ? "pass" : "fail", icon: LockKeyhole },
    { name: "Cookie exposure", detail: cookies ? "Cookies are enabled. Review third-party cookie and site permissions." : "Cookies are disabled for this browser.", status: cookies ? "warn" : "pass", icon: Globe2 },
    { name: "Browser storage", detail: storage ? "Origin storage APIs are available to this site." : "Storage APIs are unavailable.", status: storage ? "warn" : "pass", icon: ShieldCheck },
    { name: "Permission surface", detail: permissions ? "Permission state can be reviewed before granting access." : "The Permissions API is unavailable in this browser.", status: permissions ? "warn" : "pass", icon: ShieldAlert },
    { name: "Fingerprint signals", detail: `${fingerprintSignals} common browser signals are readable by websites. This is not a unique identity check.`, status: fingerprintSignals >= 4 ? "warn" : "pass", icon: Fingerprint },
    { name: "Active scripts", detail: "This scanner cannot inspect every script on other sites. Use DevTools for a complete dependency review.", status: "warn", icon: Bug },
  ]
}

const colors: Record<Status, string> = {
  pass: "text-primary border-primary/40 bg-primary/10",
  warn: "text-accent-foreground border-accent/50 bg-accent/10",
  fail: "text-destructive border-destructive/40 bg-destructive/10",
}

export function SecurityCenter() {
  const [checks, setChecks] = useState<Check[]>([])
  const [scanning, setScanning] = useState(false)
  const [scannedAt, setScannedAt] = useState<number | null>(null)

  const scan = useCallback(() => {
    setScanning(true)
    window.setTimeout(() => {
      setChecks(runChecks())
      setScannedAt(Date.now())
      setScanning(false)
    }, 180)
  }, [])

  useEffect(() => { scan() }, [scan])

  const failed = checks.filter((check) => check.status === "fail").length
  const warnings = checks.filter((check) => check.status === "warn").length
  const score = checks.length ? Math.round(((checks.length - failed - warnings * 0.35) / checks.length) * 100) : 0

  return (
    <Panel title="Cybersecurity command center" icon={ShieldCheck} accent="text-primary" action={
      <button type="button" onClick={scan} disabled={scanning} className="tva-label inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary disabled:opacity-50">
        <RefreshCw className={`h-3 w-3 ${scanning ? "animate-spin" : ""}`} aria-hidden="true" />
        {scanning ? "Scanning" : "Run checks"}
      </button>
    }>
      <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {failed ? <ShieldAlert className="h-7 w-7 text-destructive" /> : <ShieldCheck className="h-7 w-7 text-primary" />}
          <div><p className="font-mono text-2xl font-bold text-foreground">{score}%</p><p className="tva-label text-[10px] text-muted-foreground">local posture estimate</p></div>
        </div>
        <div className="ml-auto text-right font-mono text-[10px] text-muted-foreground"><p>{failed} failures / {warnings} advisories</p>{scannedAt && <p>checked {new Date(scannedAt).toLocaleTimeString()}</p>}</div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">These checks explain what this browser exposes to websites. They do not replace antivirus, endpoint protection, or a professional penetration test.</p>
      <div className="grid gap-2 md:grid-cols-2">
        {checks.map((check) => { const Icon = check.icon; return <div key={check.name} className="flex items-start gap-2 rounded-sm border border-border bg-secondary/30 p-2.5"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${colors[check.status].split(" ")[0]}`} aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground">{check.name}</p><p className="text-xs text-muted-foreground">{check.detail}</p></div><span className={`rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase ${colors[check.status]}`}>{check.status}</span></div> })}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-[10px] text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /><span>On-device checks only. No scan results leave this page.</span></div>
    </Panel>
  )
}
