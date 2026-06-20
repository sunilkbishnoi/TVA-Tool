"use client"

import { Compass } from "lucide-react"
import { useOrientation } from "@/lib/use-device-tools"
import { Button } from "@/components/ui/button"
import { Panel, StatRow, Unsupported } from "./panel"

export function SensorsPanel() {
  const { state, request } = useOrientation()

  if (!state.supported) {
    return (
      <Panel title="Motion Sensors" icon={Compass} accent="text-primary">
        <Unsupported feature="The Device Orientation API" />
      </Panel>
    )
  }

  const tilt = state.gamma ?? 0 // left-right
  const pitch = state.beta ?? 0 // front-back
  const heading = state.alpha ?? 0

  return (
    <Panel title="Motion Sensors" icon={Compass} accent="text-primary">
      {state.permission === "granted" && (state.alpha !== null || state.beta !== null) ? (
        <>
          <div className="mb-3 flex items-center justify-center">
            <div className="relative h-28 w-28 rounded-full border-2 border-border bg-secondary/60">
              {/* crosshair */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
              <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-border" />
              {/* bubble level dot driven by real tilt */}
              <div
                className="absolute h-5 w-5 rounded-full border border-primary-foreground bg-primary transition-transform duration-100"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${Math.max(-44, Math.min(44, tilt))}px, ${Math.max(
                    -44,
                    Math.min(44, pitch),
                  )}px)`,
                }}
              />
            </div>
          </div>
          <div className="divide-y divide-border">
            <StatRow label="Compass (α)" value={`${heading.toFixed(1)}°`} />
            <StatRow label="Front-back (β)" value={`${pitch.toFixed(1)}°`} />
            <StatRow label="Left-right (γ)" value={`${tilt.toFixed(1)}°`} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {state.permission === "denied"
              ? "Motion access was denied. Enable it in your browser settings."
              : "Read live accelerometer & gyroscope tilt from your device."}
          </p>
          <Button onClick={request} className="tva-label text-xs">
            Enable sensors
          </Button>
        </div>
      )}
    </Panel>
  )
}
