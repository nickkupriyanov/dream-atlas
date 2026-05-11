import { useState } from 'react'
import { AtlasPanel } from './components/AtlasPanel'
import { DreamEditor } from './components/DreamEditor'
import { DreamList } from './components/DreamList'
import { InsightsPanel } from './components/InsightsPanel'
import { useDreamStore } from './store/dreamStore'

type RightPanelMode = 'insights' | 'atlas'

function App() {
  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>('insights')
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

  return (
    <div className="relative h-screen overflow-hidden bg-night-950 text-mist-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(155,140,255,0.13),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(216,201,155,0.10),transparent_30%),linear-gradient(180deg,rgba(8,10,16,0),rgba(8,10,16,0.72))]" />
      <div className="relative grid h-full grid-cols-1 md:grid-cols-[286px_minmax(0,1fr)] lg:grid-cols-[286px_minmax(0,1fr)_338px]">
        <DreamList
          dreams={dreams}
          onCreateDream={createDream}
          onSelectDream={selectDream}
          selectedDreamId={selectedDream?.id ?? ''}
        />
        <DreamEditor
          analysisError={analysisError}
          analysisStatus={analysisStatus}
          dream={selectedDream}
          onCreateDream={createDream}
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
          onAnalyzeDream={analyzeSelectedDream}
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
        />
        <div className="hidden min-h-0 lg:block">
          <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/[0.08] bg-night-900/[0.82] lg:w-[338px]">
            <div className="border-b border-white/[0.08] px-4 py-3">
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
            {rightPanelMode === 'insights' ? (
              <InsightsPanel dream={selectedDream} />
            ) : (
              <AtlasPanel dreams={dreams} onSelectDream={selectDream} />
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
