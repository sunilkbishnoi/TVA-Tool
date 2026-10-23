"use client"

import { useState } from "react"
import { ClipboardList, Plus, Trash2 } from "lucide-react"
import { useLocalStorage } from "@/lib/use-local-storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Panel } from "./panel"

interface Note {
  id: string
  text: string
  createdAt: number
}

export function NotesPanel() {
  const { value: notes, setValue: setNotes, hydrated } = useLocalStorage<Note[]>("tempad:notes", [])
  const [draft, setDraft] = useState("")

  const add = () => {
    const text = draft.trim()
    if (!text) return
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setNotes([{ id, text, createdAt: Date.now() }, ...notes])
    setDraft("")
  }

  const remove = (id: string) => setNotes(notes.filter((n) => n.id !== id))

  return (
    <Panel title="Case File Log" icon={ClipboardList} accent="text-primary">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) add()
          }}
          placeholder="Log a temporal observation…"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={add} aria-label="Add log entry">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {hydrated && notes.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>No entries filed</EmptyTitle>
              <EmptyDescription>Entries are saved in this browser and persist across sessions.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between gap-2 rounded-sm border border-border bg-secondary/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="break-words text-sm text-foreground">{n.text}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString("en-US")}
                </p>
              </div>
              <button
                onClick={() => remove(n.id)}
                className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}
