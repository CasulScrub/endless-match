import EndlessMatch from './EndlessMatch'
import { SoundProvider } from './assets/utils/soundManager';

function App() {
  return (
    <SoundProvider>
    <div className="min-h-screen bg-gray-100 p-4">
      <EndlessMatch />
    </div>
    </SoundProvider>
  )
}

export default App