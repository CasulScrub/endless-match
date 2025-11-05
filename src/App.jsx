/**
 * App Component
 *
 * Root application component that sets up the game environment.
 *
 * Responsibilities:
 * - Provides sound context to entire app
 * - Renders gradient background
 * - Renders main game component
 *
 * The component uses a layered approach:
 * - Background layer (z-index: -10)
 * - Content layer (z-index: 10)
 */

import EmojiMatch from './components/game/EmojiMatch';
import { SoundProvider } from './context/SoundContext';
import GradientBackground from './utils/GradientBackground';

/**
 * Main App component
 *
 * Sets up the application structure with:
 * 1. SoundProvider - Makes sound functions available throughout app
 * 2. GradientBackground - Animated gradient background
 * 3. EmojiMatch - The emoji collection game component
 *
 * @returns {JSX.Element} Complete application
 */
function App() {
  return (
    // Sound provider wraps everything to enable sound throughout app
    <SoundProvider>
      <div className="relative min-h-screen">
        {/* Background gradient (behind everything) */}
        <GradientBackground />

        {/* Main content area (above background) */}
        <div className="relative z-10 p-4">
          <EmojiMatch />
        </div>
      </div>
    </SoundProvider>
  );
}

export default App