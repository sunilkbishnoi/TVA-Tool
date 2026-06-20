"use client"

import { Camera, Mic, Speaker, Webcam } from "lucide-react"
import { useMediaDevices } from "@/lib/use-device-tools"
import { Panel, StatRow, Unsupported } from "./panel"

export function MediaDevicesPanel() {
  const { state } = useMediaDevices()

  return (
    <Panel title="Media Inputs" icon={Webcam} accent="text-primary">
      {state.supported ? (
        <>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Tile icon={<Camera className="h-4 w-4" />} label="Cameras" value={state.cameras} />
            <Tile icon={<Mic className="h-4 w-4" />} label="Mics" value={state.microphones} />
            <Tile icon={<Speaker className="h-4 w-4" />} label="Outputs" value={state.speakers} />
          </div>
          <div className="divide-y divide-border">
            <StatRow label="Device labels" value={state.labelled ? "Visible" : "Hidden (grant access)"} />
          </div>
        </>
      ) : (
        <Unsupported feature="The Media Devices API" />
      )}
    </Panel>
  )
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-secondary/60 py-3">
      <span className="text-primary">{icon}</span>
      <span className="font-mono text-xl font-medium text-foreground">{value}</span>
      <span className="tva-label text-[9px] text-muted-foreground">{label}</span>
    </div>
  )
}
