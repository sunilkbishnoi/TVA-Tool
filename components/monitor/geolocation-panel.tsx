"use client"

import { MapPin } from "lucide-react"
import { useGeolocation } from "@/lib/use-device-monitor"
import { Button } from "@/components/ui/button"
import { Panel, StatRow } from "./panel"

export function GeolocationPanel() {
  const { geo, request } = useGeolocation()

  return (
    <Panel title="Position Lock" icon={MapPin} accent="text-primary">
      {geo.status === "granted" ? (
        <div className="divide-y divide-border">
          <StatRow label="Latitude" value={geo.latitude?.toFixed(5)} />
          <StatRow label="Longitude" value={geo.longitude?.toFixed(5)} />
          <StatRow label="Accuracy" value={geo.accuracy !== null ? `±${Math.round(geo.accuracy)} m` : "—"} />
          <StatRow label="Altitude" value={geo.altitude !== null ? `${Math.round(geo.altitude)} m` : "—"} />
          <StatRow label="Speed" value={geo.speed !== null ? `${geo.speed.toFixed(1)} m/s` : "—"} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {geo.status === "denied"
              ? "Permission denied. Enable location access in your browser to view coordinates."
              : geo.status === "unavailable"
                ? geo.error ?? "Location is unavailable."
                : "Read your precise location directly from device GPS / Wi-Fi positioning."}
          </p>
          <Button onClick={request} disabled={geo.status === "loading"} className="tva-label text-xs">
            {geo.status === "loading" ? "Locating…" : "Acquire position"}
          </Button>
        </div>
      )}
    </Panel>
  )
}
