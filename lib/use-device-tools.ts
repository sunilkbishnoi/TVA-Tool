"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* ------------------------------------------------------------------ */
/* Motion & Orientation sensors                                        */
/* ------------------------------------------------------------------ */

export interface OrientationState {
  supported: boolean
  permission: "idle" | "granted" | "denied" | "unsupported"
  alpha: number | null // compass / z
  beta: number | null // front-back tilt
  gamma: number | null // left-right tilt
}

export function useOrientation() {
  const [state, setState] = useState<OrientationState>({
    supported: typeof window !== "undefined" && "DeviceOrientationEvent" in window,
    permission: "idle",
    alpha: null,
    beta: null,
    gamma: null,
  })

  const attach = useCallback(() => {
    const handler = (e: DeviceOrientationEvent) => {
      setState((s) => ({
        ...s,
        permission: "granted",
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
      }))
    }
    window.addEventListener("deviceorientation", handler)
    return () => window.removeEventListener("deviceorientation", handler)
  }, [])

  const request = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setState((s) => ({ ...s, permission: "unsupported" }))
      return
    }
    // iOS 13+ requires explicit permission
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">
    }
    if (typeof DOE.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission()
        if (res !== "granted") {
          setState((s) => ({ ...s, permission: "denied" }))
          return
        }
      } catch {
        setState((s) => ({ ...s, permission: "denied" }))
        return
      }
    }
    setState((s) => ({ ...s, permission: "granted" }))
    attach()
  }, [attach])

  // Auto-attach on browsers that don't gate behind a permission prompt.
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DOE.requestPermission === "function") return // needs explicit user gesture
    const detach = attach()
    return detach
  }, [attach])

  return { state, request }
}

/* ------------------------------------------------------------------ */
/* Media devices (cameras / mics / speakers)                           */
/* ------------------------------------------------------------------ */

export interface MediaDevicesState {
  supported: boolean
  cameras: number
  microphones: number
  speakers: number
  labelled: boolean
}

export function useMediaDevices() {
  const [state, setState] = useState<MediaDevicesState>({
    supported: false,
    cameras: 0,
    microphones: 0,
    speakers: 0,
    labelled: false,
  })

  const refresh = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      setState((s) => ({ ...s, supported: false }))
      return
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setState({
        supported: true,
        cameras: devices.filter((d) => d.kind === "videoinput").length,
        microphones: devices.filter((d) => d.kind === "audioinput").length,
        speakers: devices.filter((d) => d.kind === "audiooutput").length,
        labelled: devices.some((d) => d.label !== ""),
      })
    } catch {
      setState((s) => ({ ...s, supported: false }))
    }
  }, [])

  useEffect(() => {
    refresh()
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return
    navigator.mediaDevices.addEventListener?.("devicechange", refresh)
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", refresh)
  }, [refresh])

  return { state, refresh }
}

/* ------------------------------------------------------------------ */
/* Permissions overview                                                */
/* ------------------------------------------------------------------ */

const PERMISSION_NAMES = [
  "geolocation",
  "notifications",
  "camera",
  "microphone",
  "clipboard-read",
] as const

export type PermName = (typeof PERMISSION_NAMES)[number]
export type PermStatus = "granted" | "denied" | "prompt" | "unsupported"

export function usePermissions() {
  const [perms, setPerms] = useState<Record<string, PermStatus>>({})

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      setPerms(Object.fromEntries(PERMISSION_NAMES.map((n) => [n, "unsupported" as PermStatus])))
      return
    }
    let active = true
    const statuses: PermissionStatus[] = []
    const run = async () => {
      for (const name of PERMISSION_NAMES) {
        try {
          const status = await navigator.permissions.query({ name: name as PermissionName })
          if (!active) return
          setPerms((p) => ({ ...p, [name]: status.state as PermStatus }))
          const onChange = () => setPerms((p) => ({ ...p, [name]: status.state as PermStatus }))
          status.addEventListener("change", onChange)
          statuses.push(status)
        } catch {
          if (!active) return
          setPerms((p) => ({ ...p, [name]: "unsupported" }))
        }
      }
    }
    run()
    return () => {
      active = false
      statuses.forEach((s) => (s.onchange = null))
    }
  }, [])

  return { perms, names: PERMISSION_NAMES }
}

/* ------------------------------------------------------------------ */
/* Fullscreen                                                          */
/* ------------------------------------------------------------------ */

export function useFullscreen() {
  const [active, setActive] = useState(false)
  const supported = typeof document !== "undefined" && Boolean(document.documentElement.requestFullscreen)

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      /* ignore */
    }
  }, [])

  return { supported, active, toggle }
}

/* ------------------------------------------------------------------ */
/* Screen Wake Lock                                                    */
/* ------------------------------------------------------------------ */

export function useWakeLock() {
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator
  const [active, setActive] = useState(false)
  const lockRef = useRef<WakeLockSentinel | null>(null)

  const release = useCallback(async () => {
    try {
      await lockRef.current?.release()
    } catch {
      /* ignore */
    }
    lockRef.current = null
    setActive(false)
  }, [])

  const toggle = useCallback(async () => {
    if (!supported) return
    if (lockRef.current) {
      await release()
      return
    }
    try {
      // @ts-expect-error wakeLock typing varies
      const sentinel: WakeLockSentinel = await navigator.wakeLock.request("screen")
      lockRef.current = sentinel
      setActive(true)
      sentinel.addEventListener("release", () => {
        lockRef.current = null
        setActive(false)
      })
    } catch {
      setActive(false)
    }
  }, [supported, release])

  useEffect(() => {
    return () => {
      lockRef.current?.release().catch(() => {})
    }
  }, [])

  return { supported, active, toggle }
}

/* ------------------------------------------------------------------ */
/* Vibration                                                           */
/* ------------------------------------------------------------------ */

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern)
    return true
  }
  return false
}

export const vibrationSupported = () => typeof navigator !== "undefined" && "vibrate" in navigator

/* ------------------------------------------------------------------ */
/* Clipboard                                                           */
/* ------------------------------------------------------------------ */

export function useClipboard() {
  const supported = typeof navigator !== "undefined" && Boolean(navigator.clipboard)
  const [lastRead, setLastRead] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "copied" | "read" | "error">("idle")

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus("copied")
      setTimeout(() => setStatus("idle"), 1500)
      return true
    } catch {
      setStatus("error")
      return false
    }
  }, [])

  const read = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setLastRead(text)
      setStatus("read")
      setTimeout(() => setStatus("idle"), 1500)
      return text
    } catch {
      setStatus("error")
      return null
    }
  }, [])

  return { supported, copy, read, lastRead, status }
}

/* ------------------------------------------------------------------ */
/* Microphone level meter (real getUserMedia + AnalyserNode)           */
/* ------------------------------------------------------------------ */

export function useMicLevel() {
  const supported =
    typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof AudioContext !== "undefined"
  const [level, setLevel] = useState(0) // 0..100
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    ctxRef.current?.close().catch(() => {})
    streamRef.current = null
    ctxRef.current = null
    setActive(false)
    setLevel(0)
  }, [])

  const start = useCallback(async () => {
    if (!supported) {
      setError("Microphone capture is not supported in this browser.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      setActive(true)
      setError(null)
      const loop = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)
        setLevel(Math.min(100, Math.round(rms * 240)))
        rafRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone access denied.")
      setActive(false)
    }
  }, [supported])

  useEffect(() => () => stop(), [stop])

  return { supported, level, active, error, start, stop }
}
