import EndlessMatch from './EndlessMatch'
import { SoundProvider } from './assets/utils/soundManager';
import GradientBackground from './assets/utils/GradientBackground';

function App() {
  return (
    <SoundProvider>
      <div className="relative min-h-screen">
        <GradientBackground />
        <div className="relative z-10 p-4">
          <EndlessMatch />
        </div>
      </div>
    </SoundProvider>
  )
}

export default App