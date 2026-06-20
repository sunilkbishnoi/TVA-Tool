"use client"

import { Mic, MicOff } from "lucide-react"
import { useMicLevel } from "@/lib/use-device-tools"
import { Button } from "@/components/ui/button"
import { Panel, Unsupported } from "./panel"

export function MicPanel() {
  const mic = useMicLevel()

  if (!mic.supported) {
    return (
      <Panel title="Audio Sensor" icon={MicOff} accent="text-primary">
        <Unsupported feature="Microphone capture" />
      </Panel>
    )
  }

  // 24 vertical bars driven by the live RMS level
  const bars = 24
  const activeBars = Math.round((mic.level / 100) * bars)

  return (
    <Panel
      title="Audio Sensor"
      icon={mic.active ? Mic : MicOff}
      accent={mic.active ? "text-primary" : "text-muted-foreground"}
      action={
        <span className="font-mono text-xs font-medium text-foreground">{mic.level}%</span>
      }
    >
      <div className="mb-3 flex h-24 items-end justify-between gap-0.5 rounded-sm border border-border bg-secondary/60 p-2">
        {Array.from({ length: bars }).map((_, i) => {
          const on = i < activeBars
          return (
            <div
              key={i}
              className={`flex-1 rounded-[1px] transition-all duration-75 ${
                on ? (i > bars * 0.8 ? "bg-destructive" : i > bars * 0.6 ? "bg-accent" : "bg-primary") : "bg-border/50"
              }`}
              style={{ height: `${20 + (i / bars) * 80}%` }}
            />
          )
        })}
      </div>

      {mic.error && <p className="mb-2 text-xs text-destructive">{mic.error}</p>}

      <Button
        onClick={mic.active ? mic.stop : mic.start}
        variant={mic.active ? "destructive" : "default"}
        className="tva-label w-full text-xs"
      >
        {mic.active ? "Stop listening" : "Start audio sensor"}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Live microphone amplitude. Audio never leaves your device.
      </p>
    </Panel>
  )
}
