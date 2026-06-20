import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Panel({
  title,
  icon: Icon,
  accent = "text-primary",
  action,
  className,
  children,
}: {
  title: string
  icon: LucideIcon
  accent?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-md border-2 border-border bg-card shadow-[3px_3px_0_0_hsl(var(--border))]",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b-2 border-border bg-secondary/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", accent)} aria-hidden="true" />
          <h2 className="tva-label text-xs font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function StatRow({
  label,
  value,
  mono = true,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-right text-sm font-medium text-foreground", mono && "font-mono")}>{value}</span>
    </div>
  )
}

export function Meter({
  value,
  className = "bg-primary",
}: {
  value: number // 0..100
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-sm border border-border bg-secondary"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full transition-all duration-500", className)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Unsupported({ feature }: { feature: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {feature} is not exposed by this browser. Try a Chromium-based browser for full coverage.
    </p>
  )
}
