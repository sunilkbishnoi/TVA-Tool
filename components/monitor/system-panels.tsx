import { Cpu, Monitor, Globe } from "lucide-react"
import type { DeviceState } from "@/lib/use-device-monitor"
import { Panel, StatRow } from "./panel"

export function HardwarePanel({ state }: { state: DeviceState }) {
  const h = state.hardware
  return (
    <Panel title="Chassis" icon={Cpu} accent="text-primary">
      <div className="divide-y divide-border">
        <StatRow label="Logical CPU cores" value={h.cpuCores ?? "—"} />
        <StatRow label="Device memory" value={h.deviceMemory !== null ? `~${h.deviceMemory} GB` : "—"} />
        <StatRow label="Touch points" value={h.maxTouchPoints} />
        <StatRow label="Platform" value={h.platform} />
      </div>
    </Panel>
  )
}

export function DisplayPanel({ state }: { state: DeviceState }) {
  const d = state.display
  return (
    <Panel title="Viewscreen" icon={Monitor} accent="text-primary">
      <div className="divide-y divide-border">
        <StatRow label="Screen resolution" value={`${d.screenWidth} × ${d.screenHeight}`} />
        <StatRow label="Viewport" value={`${d.viewportWidth} × ${d.viewportHeight}`} />
        <StatRow label="Pixel ratio" value={`${d.pixelRatio}×`} />
        <StatRow label="Color depth" value={`${d.colorDepth}-bit`} />
        <StatRow label="Orientation" value={d.orientation} />
      </div>
    </Panel>
  )
}

export function BrowserPanel({ state }: { state: DeviceState }) {
  const b = state.browser
  return (
    <Panel title="Operator Agent" icon={Globe} accent="text-primary">
      <div className="divide-y divide-border">
        <StatRow label="Browser" value={b.browser} />
        <StatRow label="Operating system" value={b.os} />
        <StatRow label="Language" value={b.language} />
        <StatRow label="Cookies" value={b.cookiesEnabled ? "Enabled" : "Disabled"} />
        <StatRow label="Do Not Track" value={b.doNotTrack} />
      </div>
      <p className="mt-3 truncate text-xs text-muted-foreground" title={b.userAgent}>
        {b.userAgent}
      </p>
    </Panel>
  )
}
