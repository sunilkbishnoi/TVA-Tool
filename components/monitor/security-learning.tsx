"use client"

import { useState } from "react"
import { BookOpen, CheckCircle2, ChevronDown, LockKeyhole, Shield, TriangleAlert } from "lucide-react"

const lessons = [
  {
    title: "What is TVA?",
    label: "Start here",
    icon: Shield,
    body: "TVA means Time Variance Authority in Loki. In this app, TVA is a friendly metaphor: instead of policing timelines, you learn how to protect your digital identity, devices, and accounts.",
    takeaway: "Think of every app, website, and device as a timeline you can inspect.",
  },
  {
    title: "What is a threat?",
    label: "Core concept",
    icon: TriangleAlert,
    body: "A threat is anything that could harm your data or access: a phishing message, weak password, malicious download, leaked personal detail, or unsafe network.",
    takeaway: "A warning is not proof of an attack. Verify before you panic or click.",
  },
  {
    title: "What is a vulnerability?",
    label: "Core concept",
    icon: LockKeyhole,
    body: "A vulnerability is a weakness that can be abused. Examples include outdated software, reused passwords, unnecessary permissions, and missing HTTPS protections.",
    takeaway: "Security improves when you reduce unnecessary access and keep software updated.",
  },
]

const glossary = [
  ["Phishing", "A fake message or site designed to trick you into sharing information."],
  ["MFA", "Multi-factor authentication: a second proof of identity beyond a password."],
  ["Encryption", "Scrambles information so only approved recipients can read it."],
  ["Privacy", "Control over what information is collected, shared, and retained."],
  ["Patch", "A software update that fixes bugs or security weaknesses."],
  ["Least privilege", "Give an app or account only the access it truly needs."],
]

export function SecurityLearning() {
  const [activeLesson, setActiveLesson] = useState(0)
  const [openTerm, setOpenTerm] = useState<string | null>(null)
  const lesson = lessons[activeLesson]
  const LessonIcon = lesson.icon

  return (
    <section aria-labelledby="security-learning-title" className="mb-5 space-y-4">
      <div className="rounded-md border-2 border-border bg-card p-4 shadow-[3px_3px_0_0_hsl(var(--border))] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              <span className="tva-label text-[10px]">TVA security orientation</span>
            </div>
            <h2 id="security-learning-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Learn the basics before you scan
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              This is an educational cyber security toolkit. It explains what your browser can reveal and gives safe, practical next steps. It does not replace an IT professional or detect every attack.
            </p>
          </div>
          <div className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary md:max-w-[190px]">
            <p className="font-mono font-bold">MISSION 01</p>
            <p className="mt-1 text-primary/80">Understand risk. Then reduce it.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border-2 border-border bg-card p-4 shadow-[3px_3px_0_0_hsl(var(--border))]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="tva-label text-[10px] text-muted-foreground">Field guide</p>
              <h3 className="text-lg font-bold text-foreground">Three ideas to know</h3>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{activeLesson + 1}/3</span>
          </div>
          <div className="mb-4 flex gap-2" role="tablist" aria-label="Security lessons">
            {lessons.map((item, index) => (
              <button key={item.title} type="button" role="tab" aria-selected={activeLesson === index} onClick={() => setActiveLesson(index)} className={`flex-1 rounded-sm border px-2 py-2 text-left text-xs font-medium transition-colors ${activeLesson === index ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                <span className="font-mono">0{index + 1}</span><span className="hidden sm:inline"> {item.label}</span>
              </button>
            ))}
          </div>
          <div className="rounded-sm border border-border bg-secondary/30 p-4">
            <div className="flex items-start gap-3">
              <LessonIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h4 className="font-bold text-foreground">{lesson.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.body}</p>
                <p className="mt-3 border-l-2 border-primary pl-3 text-sm font-medium text-foreground">{lesson.takeaway}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border-2 border-border bg-card p-4 shadow-[3px_3px_0_0_hsl(var(--border))]">
          <p className="tva-label text-[10px] text-muted-foreground">Quick reference</p>
          <h3 className="mb-3 text-lg font-bold text-foreground">Security glossary</h3>
          <div className="space-y-2">
            {glossary.map(([term, definition]) => {
              const isOpen = openTerm === term
              return (
                <button key={term} type="button" onClick={() => setOpenTerm(isOpen ? null : term)} aria-expanded={isOpen} className="flex w-full items-start gap-3 rounded-sm border border-border bg-secondary/30 p-3 text-left hover:bg-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-foreground">{term}</span>{isOpen && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{definition}</span>}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
