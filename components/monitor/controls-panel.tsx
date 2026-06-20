"use client"

import { Maximize, Minimize, Lock, LockOpen, Vibrate, ClipboardCopy, ClipboardPaste, SlidersHorizontal } from "lucide-react"
import {
  useFullscreen,
  useWakeLock,
  useClipboard,
  vibrate,
  vibrationSupported,
} from "@/lib/use-device-tools"
import { cn } from "@/lib/utils"
import { Panel } from "./panel"

export function ControlsPanel() {
  const fs = useFullscreen()
  const wake = useWakeLock()
  const clip = useClipboard()
  const canVibrate = vibrationSupported()

  return (
    <Panel title="Field Controls" icon={SlidersHorizontal} accent="text-primary">
      <div className="grid grid-cols-2 gap-2">
        <ControlButton
          active={fs.active}
          disabled={!fs.supported}
          onClick={fs.toggle}
          icon={fs.active ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          label={fs.active ? "Exit fullscreen" : "Fullscreen"}
        />
        <ControlButton
          active={wake.active}
          disabled={!wake.supported}
          onClick={wake.toggle}
          icon={wake.active ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
          label={wake.active ? "Wake lock on" : "Keep awake"}
        />
        <ControlButton
          disabled={!canVibrate}
          onClick={() => vibrate([60, 40, 120])}
          icon={<Vibrate className="h-4 w-4" />}
          label="Vibrate"
        />
        <ControlButton
          disabled={!clip.supported}
          onClick={() => clip.copy(`TVA TemPad report — ${new Date().toISOString()}`)}
          icon={<ClipboardCopy className="h-4 w-4" />}
          label={clip.status === "copied" ? "Copied!" : "Copy stamp"}
        />
        <ControlButton
          disabled={!clip.supported}
          onClick={clip.read}
          icon={<ClipboardPaste className="h-4 w-4" />}
          label={clip.status === "read" ? "Read!" : "Read clipboard"}
          className="col-span-2"
        />
      </div>

      {clip.lastRead !== null && (
        <div className="mt-3 rounded-sm border border-border bg-secondary/40 p-2">
          <p className="tva-label text-[9px] text-muted-foreground">Clipboard contents</p>
          <p className="mt-1 max-h-16 overflow-y-auto break-words font-mono text-xs text-foreground">
            {clip.lastRead || "(empty)"}
          </p>
        </div>
      )}
    </Panel>
  )
}

function ControlButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  className,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-sm border-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary/60 text-foreground hover:bg-secondary",
        disabled && "cursor-not-allowed opacity-40 hover:bg-secondary/60",
        className,
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
