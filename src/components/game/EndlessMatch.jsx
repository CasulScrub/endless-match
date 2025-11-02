/**
 * EndlessMatch - Main Game Component
 *
 * This is the orchestrator component for the Endless Match game.
 * It's responsible for:
 * - Composing all game UI components
 * - Connecting game logic (via hook) to presentation (via components)
 * - Determining which screen to show based on game state
 *
 * NOTE: This component contains NO game logic - all logic is in
 * the useGameLogic hook. This component is purely presentational,
 * making it easy to understand, maintain, and test.
 *
 * Architecture:
 * - useGameLogic hook: Manages all game state and logic
 * - This component: Renders appropriate UI based on game state
 * - Child components: Display specific parts of the UI
 */

import React from 'react';
import { Card } from '../ui/Card';
import { useSound } from '../../context/SoundContext';
import { useGameLogic } from '../../hooks/useGameLogic';
import WelcomeScreen from './WelcomeScreen';
import GameBoard from './GameBoard';
import GameStats from './GameStats';
import TimeDisplay from './TimeDisplay';
import VolumeControl from './VolumeControl';
import GameOverScreen from './GameOverScreen';

/**
 * Main game component
 *
 * Manages game flow and renders appropriate screens based on game state:
 * - WAITING: Shows welcome screen with start button
 * - PLAYING: Shows game board, stats, and controls
 * - ENDED: Shows game board (faded) with game over overlay
 *
 * @returns {JSX.Element} Complete game interface
 *
 * @example
 * <EndlessMatch />
 */
const EndlessMatch = () => {
  // ==================== HOOKS ====================

  /**
   * Get sound management functions
   * Used by game logic hook to play sounds at appropriate times
   */
  const soundManager = useSound();

  /**
   * Get game state and control functions
   * This hook contains ALL game logic - state, calculations, event handlers
   */
  const game = useGameLogic(soundManager);

  // ==================== RENDER ====================

  return (
    <Card className={`p-6 ${game.config.ui.maxWidth} mx-auto relative overflow-hidden`}>
      {/* ===== WAITING STATE: Welcome Screen ===== */}
      {game.gameState === game.GAME_STATES.WAITING && (
        <WelcomeScreen onStartGame={game.startGame} />
      )}

      {/* ===== PLAYING & ENDED STATES: Game Interface ===== */}
      {game.gameState !== game.GAME_STATES.WAITING && (
        <>
          {/* Top Stats Bar */}
          {/* Shows volume control, stats, and time */}
          <div className="flex justify-between mb-4">
            {/* Left side: Volume control and game stats */}
            <div className={`flex ${game.config.ui.badgeGap}`}>
              {/* Volume control button (leftmost position) */}
              <VolumeControl />

              {/* Game statistics badges (score, streak, multiplier) */}
              <GameStats
                score={game.score}
                highScore={game.highScore}
                streak={game.streak}
                multiplier={game.multiplier}
                config={game.config}
              />
            </div>

            {/* Right side: Time remaining */}
            <TimeDisplay timeLeft={game.timeLeft} config={game.config} />
          </div>

          {/* Game Board */}
          {/* Grid of tiles that player interacts with */}
          <GameBoard
            tiles={game.currentTiles}
            onTileClick={game.handleTileClick}
            matchAnimation={game.matchAnimation}
            disabled={game.gameState === game.GAME_STATES.ENDED}
            config={game.config}
          />

          {/* ===== ENDED STATE: Game Over Overlay ===== */}
          {/* Shows over the game board when time runs out */}
          {game.gameState === game.GAME_STATES.ENDED && (
            <GameOverScreen
              highScore={game.highScore}
              onPlayAgain={game.startGame}
              config={game.config}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default EndlessMatch;
