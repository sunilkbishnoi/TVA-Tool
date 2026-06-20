import { Clock } from "lucide-react"
import type { DeviceState } from "@/lib/use-device-monitor"
import { formatDate, formatTime } from "@/lib/format"
import { Panel, StatRow } from "./panel"

export function ClockPanel({ state }: { state: DeviceState }) {
  return (
    <Panel title="Temporal Index" icon={Clock}>
      <div className="rounded-sm border border-border bg-secondary/60 p-4 text-center">
        <div className="font-mono text-4xl tabular-nums tracking-tight text-primary">{formatTime(state.now)}</div>
        <div className="mt-1 text-sm text-muted-foreground">{formatDate(state.now)}</div>
      </div>
      <div className="mt-3 divide-y divide-border">
        <StatRow label="Time zone" value={state.timeZone} />
        <StatRow label="UTC offset" value={state.utcOffset} />
        <StatRow label="Epoch (ms)" value={state.now.getTime().toLocaleString()} />
      </div>
    </Panel>
  )
}
