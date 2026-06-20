import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium } from "lucide-react"
import type { DeviceState } from "@/lib/use-device-monitor"
import { formatDuration } from "@/lib/format"
import { Meter, Panel, StatRow, Unsupported } from "./panel"

export function BatteryPanel({ state }: { state: DeviceState }) {
  const b = state.battery
  const pct = b.level !== null ? Math.round(b.level * 100) : 0

  const icon = b.charging ? BatteryCharging : pct > 60 ? BatteryFull : pct > 25 ? BatteryMedium : BatteryLow
  const meterColor = pct > 50 ? "bg-primary" : pct > 20 ? "bg-accent" : "bg-destructive"

  return (
    <Panel title="Power Cell" icon={icon} accent={b.charging ? "text-accent" : "text-primary"}>
      {b.supported ? (
        <>
          <div className="mb-3 flex items-end justify-between">
            <div className="font-mono text-3xl text-foreground">{pct}%</div>
            <div className="text-sm font-medium text-muted-foreground">{b.charging ? "Charging" : "On battery"}</div>
          </div>
          <Meter value={pct} className={meterColor} />
          <div className="mt-3 divide-y divide-border">
            <StatRow label="Status" value={b.charging ? "Plugged in" : "Discharging"} />
            <StatRow label="Time to full" value={b.charging ? formatDuration(b.chargingTime) : "—"} />
            <StatRow label="Time remaining" value={!b.charging ? formatDuration(b.dischargingTime) : "—"} />
          </div>
        </>
      ) : (
        <Unsupported feature="The Battery Status API" />
      )}
    </Panel>
  )
}
