import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Layers,
  MapPinned,
  Shapes,
  SmilePlus,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type { DreamEntry } from '../types/dream'
import {
  createDreamAtlas,
  type AtlasItem,
  type EmotionAtlasItem,
  type EmotionTimelineItem,
} from '../utils/dreamAtlas'

type AtlasPanelProps = {
  dreams: DreamEntry[]
  onSelectDream: (id: string) => void
}

type SignalFilter =
  | 'all'
  | 'emotions'
  | 'symbols'
  | 'themes'
  | 'places'
  | 'characters'

const signalFilters: { label: string; value: SignalFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Emotions', value: 'emotions' },
  { label: 'Symbols', value: 'symbols' },
  { label: 'Themes', value: 'themes' },
  { label: 'Places', value: 'places' },
  { label: 'People', value: 'characters' },
]

export function AtlasPanel({ dreams, onSelectDream }: AtlasPanelProps) {
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all')
  const atlas = createDreamAtlas(dreams)
  const totalSignals =
    atlas.symbols.length +
    atlas.places.length +
    atlas.characters.length +
    atlas.themes.length +
    atlas.emotions.length

  return (
    <aside className="flex h-full min-h-0 w-full flex-col">
      <div className="border-b border-white/[0.08] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-tide/[0.22] bg-tide/10 text-tide">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-mist-100">
              Dream Atlas
            </h2>
            <p className="text-xs text-mist-400">
              {dreams.length} dreams · {totalSignals} signals
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto rounded-md border border-white/[0.08] bg-night-950/[0.36] p-1">
          {signalFilters.map((filter) => (
            <button
              className={`h-7 shrink-0 rounded px-2 text-[11px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-tide/20 ${
                signalFilter === filter.value
                  ? 'bg-white/[0.08] text-mist-100'
                  : 'text-mist-400 hover:text-mist-200'
              }`}
              key={filter.value}
              onClick={() => setSignalFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {dreams.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-mist-400">
              <CircleDashed size={18} />
            </div>
            <h3 className="mt-4 text-sm font-medium text-mist-100">
              No atlas yet
            </h3>
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-mist-400">
              Analyze dreams to reveal recurring symbols, places, characters,
              themes, and emotions.
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {dreams.length > 0 ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.24 }}
            >
              {signalFilter === 'all' || signalFilter === 'emotions' ? (
                <>
                  <EmotionTimeline
                    items={atlas.emotionTimeline}
                    onSelectDream={onSelectDream}
                  />
                  <EmotionSection
                    icon={<SmilePlus size={16} className="text-ember" />}
                    items={atlas.emotions}
                    onSelectDream={onSelectDream}
                    title="Emotional Weather"
                  />
                </>
              ) : null}
              {signalFilter === 'all' || signalFilter === 'symbols' ? (
                <AtlasSection
                  icon={<Shapes size={16} className="text-iris" />}
                  items={atlas.symbols}
                  onSelectDream={onSelectDream}
                  title="Symbols"
                />
              ) : null}
              {signalFilter === 'all' || signalFilter === 'themes' ? (
                <AtlasSection
                  icon={<Sparkles size={16} className="text-moon" />}
                  items={atlas.themes}
                  onSelectDream={onSelectDream}
                  title="Recurring Themes"
                />
              ) : null}
              {signalFilter === 'all' || signalFilter === 'places' ? (
                <AtlasSection
                  icon={<MapPinned size={16} className="text-tide" />}
                  items={atlas.places}
                  onSelectDream={onSelectDream}
                  title="Places"
                />
              ) : null}
              {signalFilter === 'all' || signalFilter === 'characters' ? (
                <AtlasSection
                  icon={<UserRound size={16} className="text-moon" />}
                  items={atlas.characters}
                  onSelectDream={onSelectDream}
                  title="Characters"
                />
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </aside>
  )
}

type AtlasSectionProps = {
  icon: ReactNode
  items: AtlasItem[]
  onSelectDream: (id: string) => void
  title: string
}

function AtlasSection({ icon, items, onSelectDream, title }: AtlasSectionProps) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-mist-100">
          {icon}
          {title}
        </div>
        <span className="text-xs text-mist-400">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.slice(0, 6).map((item) => (
            <AtlasButton
              item={item}
              key={item.label}
              onSelectDream={onSelectDream}
            />
          ))
        ) : (
          <span className="text-xs text-mist-400">Not detected yet</span>
        )}
      </div>
    </section>
  )
}

type EmotionTimelineProps = {
  items: EmotionTimelineItem[]
  onSelectDream: (id: string) => void
}

function EmotionTimeline({ items, onSelectDream }: EmotionTimelineProps) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-mist-100">
          <Sparkles size={16} className="text-tide" />
          Emotion Timeline
        </div>
        <span className="text-xs text-mist-400">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.slice(-7).map((item) => (
            <button
              className="group w-full rounded border border-white/[0.08] bg-night-950/[0.38] px-3 py-2 text-left outline-none transition hover:border-tide/25 hover:bg-tide/[0.055] focus-visible:ring-2 focus-visible:ring-tide/20"
              key={item.dreamId}
              onClick={() => onSelectDream(item.dreamId)}
              type="button"
            >
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium text-mist-100">
                  {item.date}
                </span>
                <span className="shrink-0 text-mist-400">
                  {item.dominantEmotion}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-night-950/[0.65]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide via-moon to-ember"
                  style={{ width: `${item.averageIntensity}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-mist-400">
                <span className="truncate">{item.dreamTitle}</span>
                <ArrowRight
                  className="shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  size={13}
                />
              </div>
            </button>
          ))
        ) : (
          <span className="text-xs text-mist-400">Not detected yet</span>
        )}
      </div>
    </section>
  )
}

type EmotionSectionProps = {
  icon: ReactNode
  items: EmotionAtlasItem[]
  onSelectDream: (id: string) => void
  title: string
}

function EmotionSection({
  icon,
  items,
  onSelectDream,
  title,
}: EmotionSectionProps) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-mist-100">
          {icon}
          {title}
        </div>
        <span className="text-xs text-mist-400">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.slice(0, 5).map((item) => (
            <EmotionButton
              item={item}
              key={item.label}
              onSelectDream={onSelectDream}
            />
          ))
        ) : (
          <span className="text-xs text-mist-400">Not detected yet</span>
        )}
      </div>
    </section>
  )
}

type EmotionButtonProps = {
  item: EmotionAtlasItem
  onSelectDream: (id: string) => void
}

function EmotionButton({ item, onSelectDream }: EmotionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded border border-white/[0.08] bg-night-950/[0.38] transition hover:border-ember/25 hover:bg-ember/[0.06]">
      <div className="flex items-stretch">
        <button
          className="group min-w-0 flex-1 px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ember/20"
          onClick={() => onSelectDream(item.latestDreamId)}
          type="button"
        >
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-mist-100">{item.label}</span>
            <span className="text-mist-400">
              {item.averageIntensity}% · {item.count}x
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-night-950/[0.65]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember via-moon to-tide"
              style={{ width: `${item.averageIntensity}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-mist-400">
            <span className="truncate">Last seen in {item.latestDreamTitle}</span>
            <ArrowRight
              className="shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100"
              size={13}
            />
          </div>
        </button>
        <button
          aria-label={`${isExpanded ? 'Hide' : 'Show'} related dreams for ${item.label}`}
          className="grid w-8 place-items-center border-l border-white/[0.08] text-mist-400 outline-none transition hover:text-mist-100 focus-visible:ring-2 focus-visible:ring-ember/20"
          onClick={() => setIsExpanded((value) => !value)}
          type="button"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {isExpanded ? (
        <RelatedDreamList
          dreams={item.relatedDreams}
          onSelectDream={onSelectDream}
        />
      ) : null}
    </div>
  )
}

type AtlasButtonProps = {
  item: AtlasItem
  onSelectDream: (id: string) => void
}

function AtlasButton({ item, onSelectDream }: AtlasButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded border border-white/[0.08] bg-night-950/[0.38] transition hover:border-moon/25 hover:bg-moon/[0.055]">
      <div className="flex items-stretch">
        <button
          className="group min-w-0 flex-1 px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-moon/20"
          onClick={() => onSelectDream(item.latestDreamId)}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-xs font-medium text-mist-100">
              {item.label}
            </span>
            <span className="shrink-0 rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-mist-400">
              {item.count}x
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-mist-400">
            <span className="truncate">
              {item.latestDreamDate} · {item.latestDreamTitle}
            </span>
            <ArrowRight
              className="shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100"
              size={13}
            />
          </div>
        </button>
        <button
          aria-label={`${isExpanded ? 'Hide' : 'Show'} related dreams for ${item.label}`}
          className="grid w-8 place-items-center border-l border-white/[0.08] text-mist-400 outline-none transition hover:text-mist-100 focus-visible:ring-2 focus-visible:ring-moon/20"
          onClick={() => setIsExpanded((value) => !value)}
          type="button"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {isExpanded ? (
        <RelatedDreamList
          dreams={item.relatedDreams}
          onSelectDream={onSelectDream}
        />
      ) : null}
    </div>
  )
}

type RelatedDreamListProps = {
  dreams: AtlasItem['relatedDreams']
  onSelectDream: (id: string) => void
}

function RelatedDreamList({ dreams, onSelectDream }: RelatedDreamListProps) {
  return (
    <div className="space-y-1 border-t border-white/[0.08] px-2 py-2">
      {dreams.map((dream) => (
        <button
          className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[11px] outline-none transition hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-moon/20"
          key={dream.id}
          onClick={() => onSelectDream(dream.id)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block truncate text-mist-200">{dream.title}</span>
            <span className="block truncate text-mist-400">
              {dream.date} · {dream.mood}
            </span>
          </span>
          <ArrowRight className="shrink-0 text-mist-400" size={12} />
        </button>
      ))}
    </div>
  )
}
