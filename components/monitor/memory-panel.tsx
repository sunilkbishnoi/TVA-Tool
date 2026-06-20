import { MemoryStick } from "lucide-react"
import type { DeviceState } from "@/lib/use-device-monitor"
import { formatBytes } from "@/lib/format"
import { Meter, Panel, StatRow } from "./panel"

export function MemoryPanel({ state }: { state: DeviceState }) {
  const m = state.memory

  const heapPct =
    m.usedJSHeapSize && m.jsHeapSizeLimit ? Math.round((m.usedJSHeapSize / m.jsHeapSizeLimit) * 100) : null
  const storagePct = m.storageUsage && m.storageQuota ? Math.round((m.storageUsage / m.storageQuota) * 100) : null

  return (
    <Panel title="Memory Bank" icon={MemoryStick} accent="text-primary">
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">JS Heap {m.heapSupported ? "" : "(unsupported)"}</span>
            <span className="font-mono font-medium text-foreground">{heapPct !== null ? `${heapPct}%` : "—"}</span>
          </div>
          <Meter value={heapPct ?? 0} className="bg-primary" />
          <div className="mt-1 text-xs text-muted-foreground">
            {formatBytes(m.usedJSHeapSize)} used of {formatBytes(m.jsHeapSizeLimit)} limit
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Site storage {m.storageSupported ? "" : "(unsupported)"}</span>
            <span className="font-mono font-medium text-foreground">
              {storagePct !== null ? `${storagePct}%` : "—"}
            </span>
          </div>
          <Meter value={storagePct ?? 0} className="bg-accent" />
          <div className="mt-1 text-xs text-muted-foreground">
            {formatBytes(m.storageUsage)} used of {formatBytes(m.storageQuota)} quota
          </div>
        </div>

        <div className="divide-y divide-border border-t-2 border-border pt-1">
          <StatRow label="Heap total" value={formatBytes(m.totalJSHeapSize)} />
        </div>
      </div>
    </Panel>
  )
}
