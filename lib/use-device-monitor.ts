"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface BatteryInfo {
  supported: boolean
  level: number | null // 0..1
  charging: boolean | null
  chargingTime: number | null // seconds, Infinity when not charging
  dischargingTime: number | null // seconds, Infinity when charging
}

export interface NetworkInfo {
  online: boolean
  supported: boolean // Network Information API
  effectiveType: string | null // '4g', '3g', ...
  downlink: number | null // Mbps
  rtt: number | null // ms
  saveData: boolean | null
}

export interface MemoryInfo {
  // JS heap (Chrome only)
  heapSupported: boolean
  usedJSHeapSize: number | null
  totalJSHeapSize: number | null
  jsHeapSizeLimit: number | null
  // Storage estimate
  storageSupported: boolean
  storageUsage: number | null
  storageQuota: number | null
}

export interface DisplayInfo {
  screenWidth: number
  screenHeight: number
  viewportWidth: number
  viewportHeight: number
  pixelRatio: number
  colorDepth: number
  orientation: string
}

export interface HardwareInfo {
  cpuCores: number | null
  deviceMemory: number | null // GB, coarse
  maxTouchPoints: number
  platform: string
}

export interface BrowserInfo {
  browser: string
  os: string
  language: string
  languages: string[]
  cookiesEnabled: boolean
  doNotTrack: string
  userAgent: string
}

export interface GeoInfo {
  status: "idle" | "loading" | "granted" | "denied" | "unavailable"
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  altitude: number | null
  heading: number | null
  speed: number | null
  error: string | null
}

export interface DeviceState {
  now: Date
  timeZone: string
  utcOffset: string
  battery: BatteryInfo
  network: NetworkInfo
  memory: MemoryInfo
  display: DisplayInfo
  hardware: HardwareInfo
  browser: BrowserInfo
  fps: number
  latency: number | null // ms, measured via fetch to origin
}

export interface HistoryPoint {
  t: number
  fps: number
  latency: number | null
  heap: number | null // percent of limit
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getUtcOffset(): string {
  const offsetMin = -new Date().getTimezoneOffset()
  const sign = offsetMin >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMin)
  const hh = String(Math.floor(abs / 60)).padStart(2, "0")
  const mm = String(abs % 60).padStart(2, "0")
  return `UTC${sign}${hh}:${mm}`
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Microsoft Edge"
  if (/opr\/|opera/i.test(ua)) return "Opera"
  if (/firefox\//i.test(ua)) return "Firefox"
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return "Chrome"
  if (/safari\//i.test(ua) && !/chrome/i.test(ua)) return "Safari"
  return "Unknown"
}

function parseOS(ua: string): string {
  if (/windows nt 10/i.test(ua)) return "Windows 10/11"
  if (/windows/i.test(ua)) return "Windows"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/mac os x/i.test(ua)) return "macOS"
  if (/android/i.test(ua)) return "Android"
  if (/linux/i.test(ua)) return "Linux"
  return "Unknown"
}

function readDisplay(): DisplayInfo {
  if (typeof window === "undefined") {
    return {
      screenWidth: 0,
      screenHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      pixelRatio: 1,
      colorDepth: 24,
      orientation: "unknown",
    }
  }
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,
    orientation: window.screen.orientation?.type ?? "unknown",
  }
}

function readNetwork(): NetworkInfo {
  if (typeof navigator === "undefined") {
    return { online: true, supported: false, effectiveType: null, downlink: null, rtt: null, saveData: null }
  }
  const conn =
    // @ts-expect-error vendor-prefixed
    navigator.connection || navigator.mozConnection || navigator.webkitConnection
  return {
    online: navigator.onLine,
    supported: Boolean(conn),
    effectiveType: conn?.effectiveType ?? null,
    downlink: conn?.downlink ?? null,
    rtt: conn?.rtt ?? null,
    saveData: conn?.saveData ?? null,
  }
}

async function readMemory(): Promise<MemoryInfo> {
  // @ts-expect-error non-standard
  const perfMem = typeof performance !== "undefined" ? performance.memory : undefined
  let storageUsage: number | null = null
  let storageQuota: number | null = null
  let storageSupported = false
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate()
      storageUsage = est.usage ?? null
      storageQuota = est.quota ?? null
      storageSupported = true
    } catch {
      storageSupported = false
    }
  }
  return {
    heapSupported: Boolean(perfMem),
    usedJSHeapSize: perfMem?.usedJSHeapSize ?? null,
    totalJSHeapSize: perfMem?.totalJSHeapSize ?? null,
    jsHeapSizeLimit: perfMem?.jsHeapSizeLimit ?? null,
    storageSupported,
    storageUsage,
    storageQuota,
  }
}

function readHardware(): HardwareInfo {
  if (typeof navigator === "undefined") {
    return { cpuCores: null, deviceMemory: null, maxTouchPoints: 0, platform: "unknown" }
  }
  return {
    cpuCores: navigator.hardwareConcurrency ?? null,
    // @ts-expect-error non-standard
    deviceMemory: navigator.deviceMemory ?? null,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    // platform is deprecated but still the most reliable quick read
    platform: navigator.platform || "unknown",
  }
}

function readBrowser(): BrowserInfo {
  if (typeof navigator === "undefined") {
    return {
      browser: "Unknown",
      os: "Unknown",
      language: "en",
      languages: [],
      cookiesEnabled: false,
      doNotTrack: "unspecified",
      userAgent: "",
    }
  }
  const ua = navigator.userAgent
  return {
    browser: parseBrowser(ua),
    os: parseOS(ua),
    language: navigator.language,
    languages: Array.from(navigator.languages ?? []),
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === "1" ? "enabled" : navigator.doNotTrack === "0" ? "disabled" : "unspecified",
    userAgent: ua,
  }
}

function initialState(): DeviceState {
  // Do not read browser globals during the initial render. Server and client
  // must produce identical markup; live values are populated in effects after
  // hydration completes.
  return {
    now: new Date(0),
    timeZone: "UTC",
    utcOffset: "UTC+00:00",
    battery: { supported: false, level: null, charging: null, chargingTime: null, dischargingTime: null },
    network: { online: true, supported: false, effectiveType: null, downlink: null, rtt: null, saveData: null },
    memory: {
      heapSupported: false,
      usedJSHeapSize: null,
      totalJSHeapSize: null,
      jsHeapSizeLimit: null,
      storageSupported: false,
      storageUsage: null,
      storageQuota: null,
    },
    display: {
      screenWidth: 0,
      screenHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      pixelRatio: 1,
      colorDepth: 24,
      orientation: "unknown",
    },
    hardware: { cpuCores: null, deviceMemory: null, maxTouchPoints: 0, platform: "unknown" },
    browser: {
      browser: "Unknown",
      os: "Unknown",
      language: "en",
      languages: [],
      cookiesEnabled: false,
      doNotTrack: "unspecified",
      userAgent: "",
    },
    fps: 0,
    latency: null,
  }
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useDeviceMonitor(refreshMs = 2000) {
  const [state, setState] = useState<DeviceState>(initialState)
  const [history, setHistory] = useState<HistoryPoint[]>([])

  const fpsRef = useRef(0)
  const latencyRef = useRef<number | null>(null)

  /* ---- One-time reads: browser, hardware, display ---- */
  useEffect(() => {
    setState((s) => ({
      ...s,
      now: new Date(),
      browser: readBrowser(),
      hardware: readHardware(),
      display: readDisplay(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: getUtcOffset(),
    }))
  }, [])

  /* ---- Clock: tick every second ---- */
  useEffect(() => {
    const id = setInterval(() => setState((s) => ({ ...s, now: new Date() })), 1000)
    return () => clearInterval(id)
  }, [])

  /* ---- Battery API ---- */
  useEffect(() => {
    // @ts-expect-error vendor
    if (typeof navigator === "undefined" || !navigator.getBattery) return
    let battery: any
    const update = () =>
      setState((s) => ({
        ...s,
        battery: {
          supported: true,
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        },
      }))
    // @ts-expect-error vendor
    navigator.getBattery().then((b: any) => {
      battery = b
      update()
      b.addEventListener("levelchange", update)
      b.addEventListener("chargingchange", update)
      b.addEventListener("chargingtimechange", update)
      b.addEventListener("dischargingtimechange", update)
    })
    return () => {
      if (!battery) return
      battery.removeEventListener("levelchange", update)
      battery.removeEventListener("chargingchange", update)
      battery.removeEventListener("chargingtimechange", update)
      battery.removeEventListener("dischargingtimechange", update)
    }
  }, [])

  /* ---- Network: online/offline + connection change ---- */
  useEffect(() => {
    const update = () => setState((s) => ({ ...s, network: readNetwork() }))
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    // @ts-expect-error vendor
    const conn = navigator.connection
    conn?.addEventListener?.("change", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
      conn?.removeEventListener?.("change", update)
    }
  }, [])

  /* ---- Display: react to resize / orientation ---- */
  useEffect(() => {
    const update = () => setState((s) => ({ ...s, display: readDisplay() }))
    window.addEventListener("resize", update)
    window.screen.orientation?.addEventListener?.("change", update)
    return () => {
      window.removeEventListener("resize", update)
      window.screen.orientation?.removeEventListener?.("change", update)
    }
  }, [])

  /* ---- FPS meter via requestAnimationFrame ---- */
  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = (t: number) => {
      frames++
      if (t - last >= 1000) {
        fpsRef.current = Math.round((frames * 1000) / (t - last))
        frames = 0
        last = t
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ---- Real latency probe: time a no-store request to our own origin ---- */
  const measureLatency = useCallback(async () => {
    try {
      const start = performance.now()
      await fetch(`${window.location.origin}/favicon.ico?_=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      })
      latencyRef.current = Math.round(performance.now() - start)
    } catch {
      latencyRef.current = null
    }
  }, [])

  /* ---- Periodic refresh: memory + fps snapshot + latency + history ---- */
  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      await measureLatency()
      const memory = await readMemory()
      if (cancelled) return
      const fps = fpsRef.current
      const latency = latencyRef.current
      setState((s) => ({ ...s, memory, network: readNetwork(), fps, latency }))
      const heapPct =
        memory.usedJSHeapSize && memory.jsHeapSizeLimit
          ? Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
          : null
      setHistory((h) => [...h.slice(-59), { t: Date.now(), fps, latency, heap: heapPct }])
    }
    tick()
    const id = setInterval(tick, refreshMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [refreshMs, measureLatency])

  return { state, history }
}

/* ------------------------------------------------------------------ */
/* Geolocation (opt-in, on demand)                                     */
/* ------------------------------------------------------------------ */

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoInfo>({
    status: "idle",
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    heading: null,
    speed: null,
    error: null,
  })

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo((g) => ({ ...g, status: "unavailable", error: "Geolocation is not supported by this browser." }))
      return
    }
    setGeo((g) => ({ ...g, status: "loading", error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = pos.coords
        setGeo({
          status: "granted",
          latitude: c.latitude,
          longitude: c.longitude,
          accuracy: c.accuracy,
          altitude: c.altitude,
          heading: c.heading,
          speed: c.speed,
          error: null,
        })
      },
      (err) => {
        setGeo((g) => ({
          ...g,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          error: err.message,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [])

  return { geo, request }
}
