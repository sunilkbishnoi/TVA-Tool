"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * A small, SSR-safe localStorage hook.
 * - Reads the stored value on mount (avoids hydration mismatches).
 * - Persists updates as JSON.
 * - Syncs across tabs via the native `storage` event.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // Load the persisted value once, on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch (err) {
      console.error("[v0] useLocalStorage read failed:", err)
    } finally {
      setHydrated(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist whenever the value changes (after hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error("[v0] useLocalStorage write failed:", err)
    }
  }, [key, value, hydrated])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return
      try {
        setValue(JSON.parse(e.newValue) as T)
      } catch {
        /* ignore malformed values from other tabs */
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [key])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return { value, setValue, reset, hydrated }
}
