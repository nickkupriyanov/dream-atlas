import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { CalendarDays, Moon, Plus, Search, Sparkle } from 'lucide-react'
import type { DreamEntry } from '../types/dream'
import { getDreamSignature, getDreamTitle } from '../utils/dreamSignature'

type DreamListProps = {
  dreams: DreamEntry[]
  selectedDreamId: string
  onCreateDream: () => void
  onSelectDream: (id: string) => void
}

export function DreamList({
  dreams,
  selectedDreamId,
  onCreateDream,
  onSelectDream,
}: DreamListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredDreams = useMemo(() => {
    if (!normalizedQuery) {
      return dreams
    }

    return dreams.filter((dream) => {
      const searchableText = [
        dream.title,
        dream.date,
        dream.time,
        dream.mood,
        dream.text,
        dream.analysis.summary,
        dream.analysis.tone,
        ...dream.analysis.emotions.map((emotion) => emotion.label),
        ...dream.analysis.symbols.flatMap((symbol) => [
          symbol.label,
          symbol.meaning,
        ]),
        ...dream.analysis.places,
        ...dream.analysis.characters,
        ...dream.analysis.recurringThemes,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedQuery)
    })
  }, [dreams, normalizedQuery])

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.08] bg-night-900/[0.78] md:w-[286px]">
      <div className="border-b border-white/[0.08] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-moon/20 bg-moon/[0.08] text-moon">
              <Moon size={18} />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-normal text-mist-100">
                Dream Atlas
              </h1>
              <p className="text-xs text-mist-400">AI dream journal</p>
            </div>
          </div>
          <button
            aria-label="New dream"
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-mist-300 outline-none transition hover:border-moon/30 hover:bg-moon/10 hover:text-moon focus-visible:border-moon/50 focus-visible:ring-2 focus-visible:ring-moon/20 active:scale-95"
            onClick={onCreateDream}
          >
            <Plus size={16} />
          </button>
        </div>

        <label className="mt-4 flex items-center gap-2 rounded-md border border-white/[0.08] bg-night-950/[0.55] px-3 py-2 text-sm text-mist-400 focus-within:border-moon/25 focus-within:bg-night-950/80">
          <Search size={15} />
          <input
            className="w-full bg-transparent text-mist-200 outline-none placeholder:text-mist-400"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search dreams"
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {dreams.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-3 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-moon/20 bg-moon/[0.08] text-moon">
              <Sparkle size={17} />
            </div>
            <h2 className="mt-4 text-sm font-medium text-mist-100">
              No dreams yet
            </h2>
            <p className="mt-2 text-xs leading-5 text-mist-400">
              Start with a blank note and let the pattern emerge after writing.
            </p>
            <button
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-moon/25 bg-moon/[0.1] px-3 text-xs font-medium text-moon outline-none transition hover:border-moon/40 hover:bg-moon/[0.16] focus-visible:ring-2 focus-visible:ring-moon/20"
              onClick={onCreateDream}
            >
              <Plus size={14} />
              New dream
            </button>
          </div>
        ) : null}

        {dreams.length > 0 && filteredDreams.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-3 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-mist-400">
              <Search size={17} />
            </div>
            <h2 className="mt-4 text-sm font-medium text-mist-100">
              No matching dreams
            </h2>
            <p className="mt-2 text-xs leading-5 text-mist-400">
              Search looks through notes, moods, symbols, places, characters,
              and themes.
            </p>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {filteredDreams.map((dream, index) => {
            const isSelected = dream.id === selectedDreamId
            const signature = getDreamSignature(dream.analysis)
            const title = getDreamTitle(dream)

            return (
              <motion.button
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`group relative w-full overflow-hidden rounded-md border p-3 text-left outline-none transition ${
                  isSelected
                    ? 'border-moon/[0.34] bg-white/[0.065] shadow-glow'
                    : 'border-white/[0.06] bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-white/[0.06] hover:shadow-soft'
                }`}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                key={dream.id}
                onClick={() => onSelectDream(dream.id)}
                transition={{ delay: index * 0.035, duration: 0.22 }}
                whileTap={{ scale: 0.985 }}
              >
                <span
                  className="absolute inset-y-3 left-0 w-1 rounded-r-full opacity-90"
                  style={{ background: signature.gradient }}
                />
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                  style={{ background: signature.aura }}
                />
                {isSelected ? (
                  <motion.span
                    className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-moon/25"
                    layoutId="selected-dream-ring"
                    transition={{ duration: 0.26, ease: 'easeOut' }}
                  />
                ) : null}
                <span className="absolute inset-0 rounded-md ring-0 ring-moon/0 transition group-focus-visible:ring-2 group-focus-visible:ring-moon/30" />
                <div className="flex items-start justify-between gap-2">
                  <h2 className="relative line-clamp-2 text-sm font-medium leading-snug text-mist-100">
                    {title}
                  </h2>
                  <span className="relative rounded border border-white/[0.08] bg-night-950/[0.25] px-1.5 py-0.5 text-[10px] text-mist-400">
                    {dream.time}
                  </span>
                </div>
                <div className="relative mt-3 flex items-center gap-1.5 text-xs text-mist-400">
                  <CalendarDays size={13} />
                  <span>{dream.date}</span>
                  <span className="h-1 w-1 rounded-full bg-mist-400/60" />
                  <span>{dream.mood}</span>
                </div>
                <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-mist-300/[0.78]">
                  {dream.text ||
                    'A blank page for the dream you just woke from.'}
                </p>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </aside>
  )
}
