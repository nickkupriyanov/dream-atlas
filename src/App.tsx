import { useEffect, useState } from 'react'
import { Brain, Feather, Layers, List } from 'lucide-react'
import { AtlasPanel } from './components/AtlasPanel'
import { DreamEditor } from './components/DreamEditor'
import { DreamList } from './components/DreamList'
import { InsightsPanel } from './components/InsightsPanel'
import { useDreamStore } from './store/dreamStore'

type RightPanelMode = 'insights' | 'atlas'
type MobileView = 'list' | 'editor' | 'insights' | 'atlas'
type SaveStatus = 'saved' | 'saving'

const mobileViews: {
  icon: typeof List
  label: string
  value: MobileView
}[] = [
  { icon: List, label: 'List', value: 'list' },
  { icon: Feather, label: 'Write', value: 'editor' },
  { icon: Brain, label: 'Insights', value: 'insights' },
  { icon: Layers, label: 'Atlas', value: 'atlas' },
]

function App() {
  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>('insights')
  const [mobileView, setMobileView] = useState<MobileView>('editor')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [isCaptureMode, setIsCaptureMode] = useState(false)
  const {
    analysisError,
    analysisStatus,
    analyzeSelectedDream,
    createDream,
    deleteDream,
    dreams,
    selectDream,
    selectedDreamId,
    updateDreamDate,
    updateDreamMood,
    updateDreamTitle,
    updateDreamText,
  } = useDreamStore()

  const selectedDream =
    dreams.find((dream) => dream.id === selectedDreamId) ?? dreams[0]

  useEffect(() => {
    if (!selectedDream) {
      setSaveStatus('saved')
      return
    }

    setSaveStatus('saving')
    const timeout = window.setTimeout(() => setSaveStatus('saved'), 420)

    return () => window.clearTimeout(timeout)
  }, [selectedDream])

  function createAndOpenDream() {
    createDream()
    setMobileView('editor')
    setIsCaptureMode(true)
  }

  function selectAndOpenDream(id: string) {
    selectDream(id)
    setMobileView('editor')
  }

  return (
    <div className="relative h-screen overflow-hidden bg-night-950 text-mist-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(155,140,255,0.13),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(216,201,155,0.10),transparent_30%),linear-gradient(180deg,rgba(8,10,16,0),rgba(8,10,16,0.72))]" />
      <div className="relative flex h-full flex-col md:grid md:grid-cols-[286px_minmax(0,1fr)] lg:grid-cols-[286px_minmax(0,1fr)_338px]">
        <nav className="grid grid-cols-4 gap-1 border-b border-white/[0.08] bg-night-950/80 p-2 md:hidden">
          {mobileViews.map((view) => {
            const Icon = view.icon

            return (
              <button
                className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-[11px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-moon/20 ${
                  mobileView === view.value
                    ? 'bg-white/[0.08] text-mist-100'
                    : 'text-mist-400 hover:text-mist-200'
                }`}
                key={view.value}
                onClick={() => setMobileView(view.value)}
                type="button"
              >
                <Icon size={14} />
                {view.label}
              </button>
            )
          })}
        </nav>

        <div
          className={`min-h-0 flex-1 md:flex ${
            mobileView === 'list' ? 'flex' : 'hidden'
          }`}
        >
          <DreamList
            dreams={dreams}
            onCreateDream={createAndOpenDream}
            onSelectDream={selectAndOpenDream}
            selectedDreamId={selectedDream?.id ?? ''}
          />
        </div>

        <div
          className={`min-h-0 flex-1 md:flex ${
            mobileView === 'editor' ? 'flex' : 'hidden'
          }`}
        >
          <DreamEditor
            analysisError={analysisError}
            analysisStatus={analysisStatus}
            dream={selectedDream}
            isCaptureMode={isCaptureMode}
            onAnalyzeDream={analyzeSelectedDream}
            onCreateDream={createAndOpenDream}
            onDateChange={(date) => {
              if (selectedDream) {
                updateDreamDate(selectedDream.id, date)
              }
            }}
            onDeleteDream={() => {
              if (selectedDream) {
                deleteDream(selectedDream.id)
              }
            }}
            onMoodChange={(mood) => {
              if (selectedDream) {
                updateDreamMood(selectedDream.id, mood)
              }
            }}
            onTextChange={(text) => {
              if (selectedDream) {
                updateDreamText(selectedDream.id, text)
              }
            }}
            onTitleChange={(title) => {
              if (selectedDream) {
                updateDreamTitle(selectedDream.id, title)
              }
            }}
            onToggleCaptureMode={() =>
              setIsCaptureMode((currentMode) => !currentMode)
            }
            saveStatus={saveStatus}
          />
        </div>

        <div
          className={`min-h-0 flex-1 lg:block ${
            mobileView === 'insights' || mobileView === 'atlas'
              ? 'block'
              : 'hidden'
          }`}
        >
          <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/[0.08] bg-night-900/[0.82] lg:w-[338px]">
            <div className="hidden border-b border-white/[0.08] px-4 py-3 lg:block">
              <div className="grid grid-cols-2 rounded-md border border-white/[0.08] bg-night-950/[0.4] p-1">
                <button
                  className={`h-8 rounded text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-moon/20 ${
                    rightPanelMode === 'insights'
                      ? 'bg-white/[0.08] text-mist-100'
                      : 'text-mist-400 hover:text-mist-200'
                  }`}
                  onClick={() => setRightPanelMode('insights')}
                  type="button"
                >
                  Insights
                </button>
                <button
                  className={`h-8 rounded text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-tide/20 ${
                    rightPanelMode === 'atlas'
                      ? 'bg-white/[0.08] text-mist-100'
                      : 'text-mist-400 hover:text-mist-200'
                  }`}
                  onClick={() => setRightPanelMode('atlas')}
                  type="button"
                >
                  Atlas
                </button>
              </div>
            </div>
            {(mobileView === 'insights' && rightPanelMode !== 'atlas') ||
            (mobileView !== 'atlas' && rightPanelMode === 'insights') ? (
              <InsightsPanel dream={selectedDream} />
            ) : (
              <AtlasPanel dreams={dreams} onSelectDream={selectAndOpenDream} />
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
