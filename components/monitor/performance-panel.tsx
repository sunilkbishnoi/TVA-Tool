"use client"

import { Activity } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DeviceState, HistoryPoint } from "@/lib/use-device-monitor"
import { Panel } from "./panel"

export function PerformancePanel({ state, history }: { state: DeviceState; history: HistoryPoint[] }) {
  const data = history.map((p) => ({
    time: new Date(p.t).toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" }),
    fps: p.fps,
    latency: p.latency ?? 0,
  }))

  return (
    <Panel
      title="Timeline Telemetry"
      icon={Activity}
      accent="text-primary"
      action={
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" /> FPS{" "}
            <span className="font-mono font-medium text-foreground">{state.fps}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" /> Latency{" "}
            <span className="font-mono font-medium text-foreground">{state.latency ?? "—"}ms</span>
          </span>
        </div>
      }
    >
      <div className="h-56 w-full">
        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Collecting live samples…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                stroke="hsl(var(--border))"
                minTickGap={40}
              />
              <YAxis
                yAxisId="fps"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                stroke="hsl(var(--border))"
                domain={[0, 120]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "2px solid hsl(var(--border))",
                  borderRadius: 4,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Line
                yAxisId="fps"
                type="monotone"
                dataKey="fps"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="FPS"
              />
              <Line
                yAxisId="fps"
                type="monotone"
                dataKey="latency"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  )
}
