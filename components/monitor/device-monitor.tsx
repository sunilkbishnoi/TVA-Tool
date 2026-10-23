"use client"

import { useEffect, useState } from "react"
import { Gauge, Hourglass } from "lucide-react"
import { useDeviceMonitor } from "@/lib/use-device-monitor"
import { useLocalStorage } from "@/lib/use-local-storage"
import { formatTime } from "@/lib/format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClockPanel } from "./clock-panel"
import { BatteryPanel } from "./battery-panel"
import { NetworkPanel } from "./network-panel"
import { MemoryPanel } from "./memory-panel"
import { GeolocationPanel } from "./geolocation-panel"
import { PerformancePanel } from "./performance-panel"
import { NotesPanel } from "./notes-panel"
import { HardwarePanel, DisplayPanel, BrowserPanel } from "./system-panels"
import { SensorsPanel } from "./sensors-panel"
import { MediaDevicesPanel } from "./media-devices-panel"
import { PermissionsPanel } from "./permissions-panel"
import { ControlsPanel } from "./controls-panel"
import { MicPanel } from "./mic-panel"
import { SecurityAuditPanel } from "./security-audit-panel"

const REFRESH_OPTIONS = [
  { label: "1s", value: 1000 },
  { label: "2s", value: 2000 },
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
]

export function DeviceMonitor() {
  const [mounted, setMounted] = useState(false)
  const { value: refreshMs, setValue: setRefreshMs } = useLocalStorage<number>("tempad:refresh", 2000)
  const { state, history } = useDeviceMonitor(refreshMs)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen text-foreground" aria-busy="true" aria-label="Loading TVA TemPad">
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8">
          <div className="h-24 animate-pulse rounded-md border-2 border-border bg-card" />
          <div className="mt-5 h-48 animate-pulse rounded-md border-2 border-border bg-card" />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-md border-2 border-border bg-card" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8">
        {/* Header */}
        <header className="mb-5 rounded-md border-2 border-border bg-card p-3 shadow-[3px_3px_0_0_hsl(var(--border))] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-2 border-primary bg-primary/10">
                <Hourglass className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none tracking-tight text-foreground">
                  TVA <span className="text-primary">TEMPAD</span>
                </h1>
                <p className="tva-label mt-1 text-[10px] text-muted-foreground">Temporal Variance Monitor</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 rounded-sm border-2 border-border bg-secondary/60 px-3 py-1.5 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span suppressHydrationWarning className="font-mono font-medium text-foreground">{formatTime(state.now)}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Select value={String(refreshMs)} onValueChange={(v) => setRefreshMs(Number(v))}>
                  <SelectTrigger className="h-9 w-[120px] border-2 border-border bg-secondary/60 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFRESH_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        Scan {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Telemetry chart spans full width */}
        <div className="mb-5">
          <PerformancePanel state={state} history={history} />
        </div>

        {/* Data grid — mobile first single column */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ClockPanel state={state} />
          <BatteryPanel state={state} />
          <NetworkPanel state={state} />
          <MemoryPanel state={state} />
          <SensorsPanel />
          <MicPanel />
          <MediaDevicesPanel />
          <PermissionsPanel />
          <SecurityAuditPanel />
          <ControlsPanel />
          <HardwarePanel state={state} />
          <DisplayPanel state={state} />
          <BrowserPanel state={state} />
          <GeolocationPanel />
          <NotesPanel />
        </div>

        <footer className="mt-6 flex items-center justify-center gap-2 border-t-2 border-border pt-4 text-center text-xs text-muted-foreground">
          <Hourglass className="h-3.5 w-3.5 shrink-0" />
          <span className="text-balance">
            For all time. Always. All readings come live from your browser&apos;s Web APIs — nothing is sent to a server.
          </span>
        </footer>
      </div>
    </div>
  )
}
