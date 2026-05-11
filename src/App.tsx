import { DreamEditor } from './components/DreamEditor'
import { DreamList } from './components/DreamList'
import { InsightsPanel } from './components/InsightsPanel'
import { useDreamStore } from './store/dreamStore'

function App() {
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
          <InsightsPanel dream={selectedDream} />
        </div>
      </div>
    </div>
  )
}

export default App
