import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  PenLine,
  Plus,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { DreamEntry } from '../types/dream'
import { getDreamSignature } from '../utils/dreamSignature'

type DreamEditorProps = {
  analysisError: string | null
  analysisStatus: 'idle' | 'loading' | 'success' | 'error'
  dream?: DreamEntry
  onCreateDream: () => void
  onDateChange: (date: string) => void
  onDeleteDream: () => void
  onMoodChange: (mood: string) => void
  onTitleChange: (title: string) => void
  onTextChange: (text: string) => void
  onAnalyzeDream: () => void
}

export function DreamEditor({
  analysisError,
  analysisStatus,
  dream,
  onCreateDream,
  onDateChange,
  onDeleteDream,
  onMoodChange,
  onTitleChange,
  onTextChange,
  onAnalyzeDream,
}: DreamEditorProps) {
  if (!dream) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-night-850 px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-md border border-moon/20 bg-moon/[0.08] text-moon">
          <PenLine size={20} />
        </div>
        <h2 className="mt-5 font-serif text-3xl text-mist-100">
          Start a dream note
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-mist-400">
          The journal is empty. Create a record and keep the first details close
          to the moment you woke.
        </p>
        <button
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-moon/25 bg-moon/[0.12] px-4 text-sm font-medium text-moon outline-none transition hover:border-moon/[0.45] hover:bg-moon/[0.18] focus-visible:ring-2 focus-visible:ring-moon/20"
          onClick={onCreateDream}
        >
          <Plus size={16} />
          New dream
        </button>
      </main>
    )
  }

  const signature = getDreamSignature(dream.analysis)

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-night-850">
      <header className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            key={dream.id}
            transition={{ duration: 0.24 }}
          >
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-moon/70">
              <PenLine size={14} />
              <span>Lucid note</span>
              <span
                className="ml-1 h-1.5 w-12 rounded-full"
                style={{ background: signature.gradient }}
              />
            </div>
            <input
              aria-label="Dream title"
              className="w-full max-w-3xl bg-transparent font-serif text-3xl leading-tight text-mist-100 outline-none transition placeholder:text-mist-400/60 focus:text-white lg:text-4xl"
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Untitled Dream"
              value={dream.title}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mist-400">
              <label className="inline-flex h-8 items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-mist-300 transition focus-within:border-moon/25 focus-within:bg-night-950/40">
                <CalendarDays size={14} />
                <input
                  aria-label="Dream date"
                  className="w-20 bg-transparent text-mist-200 outline-none placeholder:text-mist-400"
                  onChange={(event) => onDateChange(event.target.value)}
                  placeholder="Date"
                  value={dream.date}
                />
              </label>
              <span className="h-1 w-1 rounded-full bg-mist-400/50" />
              <span className="flex items-center gap-1.5">
                <Clock3 size={14} />
                {dream.time}
              </span>
              <input
                aria-label="Dream mood"
                className="h-8 w-32 rounded border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-mist-300 outline-none transition placeholder:text-mist-400 focus:border-moon/25 focus:bg-night-950/40"
                onChange={(event) => onMoodChange(event.target.value)}
                placeholder="Mood"
                value={dream.mood}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label="Delete dream"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-mist-400 outline-none transition hover:border-ember/35 hover:bg-ember/[0.08] hover:text-ember focus-visible:ring-2 focus-visible:ring-ember/20"
            onClick={onDeleteDream}
            type="button"
          >
            <Trash2 size={16} />
          </button>
          <motion.button
            className="inline-flex h-10 min-w-[164px] items-center justify-center gap-2 whitespace-nowrap rounded-md border border-moon/25 bg-moon/[0.12] px-4 text-sm font-medium text-moon outline-none transition hover:border-moon/[0.45] hover:bg-moon/[0.18] focus-visible:ring-2 focus-visible:ring-moon/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!dream.text.trim() || analysisStatus === 'loading'}
            onClick={onAnalyzeDream}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {analysisStatus === 'loading' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {analysisStatus === 'loading' ? 'Analyzing...' : 'Analyze Dream'}
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {analysisStatus !== 'idle' ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`mx-4 mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs lg:mx-8 ${
              analysisStatus === 'error'
                ? 'border-ember/30 bg-ember/[0.08] text-ember'
                : analysisStatus === 'success'
                  ? 'border-tide/30 bg-tide/[0.08] text-tide'
                  : 'border-moon/25 bg-moon/[0.08] text-moon'
            }`}
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: -6 }}
          >
            {analysisStatus === 'loading' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : analysisStatus === 'success' ? (
              <CheckCircle2 size={14} />
            ) : (
              <XCircle size={14} />
            )}
            <span>
              {analysisStatus === 'loading'
                ? 'Reading the dream through the backend...'
                : analysisStatus === 'success'
                  ? 'Analysis updated and saved.'
                  : analysisError}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="min-h-0 flex-1 overflow-hidden px-4 py-4 lg:px-8 lg:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative h-full overflow-hidden rounded-md border border-white/[0.08] bg-night-950/[0.46] shadow-soft transition focus-within:border-moon/25 focus-within:ring-2 focus-within:ring-moon/10"
            exit={{ opacity: 0, scale: 0.99, y: -8 }}
            initial={{ opacity: 0, scale: 0.99, y: 8 }}
            key={dream.id}
            transition={{ duration: 0.28 }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{ background: signature.aura }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
              style={{ background: signature.gradient }}
            />
            <textarea
              className="relative h-full w-full resize-none rounded-md bg-transparent px-5 py-5 font-serif text-lg leading-8 text-mist-100 outline-none placeholder:text-mist-400/70 lg:px-8 lg:py-7"
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Write what stayed with you: places, fragments, voices, colors..."
              spellCheck="true"
              value={dream.text}
            />
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  )
}
