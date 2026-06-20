"use client"

import { ShieldCheck } from "lucide-react"
import { usePermissions, type PermStatus } from "@/lib/use-device-tools"
import { Panel } from "./panel"

const LABELS: Record<string, string> = {
  geolocation: "Location",
  notifications: "Notifications",
  camera: "Camera",
  microphone: "Microphone",
  "clipboard-read": "Clipboard read",
}

function badge(status: PermStatus | undefined) {
  switch (status) {
    case "granted":
      return "border-primary/40 bg-primary/10 text-primary"
    case "denied":
      return "border-destructive/40 bg-destructive/10 text-destructive"
    case "prompt":
      return "border-accent/50 bg-accent/15 text-accent-foreground"
    default:
      return "border-border bg-secondary text-muted-foreground"
  }
}

export function PermissionsPanel() {
  const { perms, names } = usePermissions()

  return (
    <Panel title="Clearance Status" icon={ShieldCheck} accent="text-primary">
      <div className="divide-y divide-border">
        {names.map((name) => {
          const status = perms[name]
          return (
            <div key={name} className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-muted-foreground">{LABELS[name] ?? name}</span>
              <span
                className={`tva-label rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${badge(status)}`}
              >
                {status ?? "checking"}
              </span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
