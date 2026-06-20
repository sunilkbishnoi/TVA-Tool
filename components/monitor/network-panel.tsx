import { Wifi, WifiOff } from "lucide-react"
import type { DeviceState } from "@/lib/use-device-monitor"
import { Panel, StatRow } from "./panel"

export function NetworkPanel({ state }: { state: DeviceState }) {
  const n = state.network
  const latency = state.latency

  const latencyLabel = latency === null ? "—" : `${latency} ms`
  const latencyColor =
    latency === null
      ? "text-muted-foreground"
      : latency < 80
        ? "text-primary"
        : latency < 200
          ? "text-accent"
          : "text-destructive"

  return (
    <Panel
      title="Comms Link"
      icon={n.online ? Wifi : WifiOff}
      accent={n.online ? "text-primary" : "text-destructive"}
      action={
        <span
          className={`tva-label rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${
            n.online
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {n.online ? "Online" : "Offline"}
        </span>
      }
    >
      <div className="mb-3 rounded-sm border border-border bg-secondary/60 p-4 text-center">
        <div className="tva-label text-[10px] text-muted-foreground">Live latency (to origin)</div>
        <div className={`font-mono text-3xl ${latencyColor}`}>{latencyLabel}</div>
      </div>
      <div className="divide-y divide-border">
        <StatRow label="Connection" value={n.effectiveType ? n.effectiveType.toUpperCase() : "Unknown"} />
        <StatRow label="Downlink" value={n.downlink !== null ? `${n.downlink} Mbps` : "—"} />
        <StatRow label="Round-trip (est.)" value={n.rtt !== null ? `${n.rtt} ms` : "—"} />
        <StatRow label="Data saver" value={n.saveData === null ? "—" : n.saveData ? "On" : "Off"} />
      </div>
    </Panel>
  )
}
