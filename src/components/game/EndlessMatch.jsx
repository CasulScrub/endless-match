/**
 * EndlessMatch - Hybrid Tile + Emoji Collection Game
 *
 * This combines the original tile-matching game with emoji collection mechanics.
 *
 * Game mechanics:
 * - Board has colored shape tiles (like original)
 * - Emojis randomly spawn ON TOP of tiles as temporary overlays
 * - Match tiles by color+shape (normal gameplay)
 * - If matched tiles both have the SAME emoji = COLLECTION BONUS!
 * - Emojis disappear after lifetime
 * - Global timer counts down (game ends at 0)
 * - Regular matches: +3 seconds
 * - Emoji matches: +10 seconds + add to collection
 *
 * Architecture:
 * - useHybridGameLogic hook: Manages all state and logic
 * - This component: Renders UI based on state
 * - Child components: Display specific UI elements
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useSound } from '../../context/SoundContext';
import { useHybridGameLogic } from '../../hooks/useHybridGameLogic';
import WelcomeScreen from './WelcomeScreen';
import HybridTile from './HybridTile';
import GameStats from './GameStats';
import TimeDisplay from './TimeDisplay';
import VolumeControl from './VolumeControl';
import GameOverScreen from './GameOverScreen';
import CollectionGallery from './CollectionGallery';
import { BookOpen } from 'lucide-react';
import { GAME_CONFIG } from '../../config/gameConfig';

/**
 * Main game component
 *
 * @returns {JSX.Element} Complete game interface
 */
const EndlessMatch = () => {
  // ==================== HOOKS ====================

  const soundManager = useSound();
  const game = useHybridGameLogic(soundManager);

  /**
   * Collection gallery modal state
   */
  const [showGallery, setShowGallery] = useState(false);

  // ==================== HANDLERS ====================

  const handleOpenGallery = () => {
    soundManager.playSound('tileClick');
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  // ==================== RENDER ====================

  return (
    <>
      <Card className="p-6 max-w-2xl mx-auto relative overflow-hidden">
        {/* ===== WAITING STATE: Welcome Screen ===== */}
        {game.gameState === game.GAME_STATES.WAITING && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Endless Match</h1>
            <p className="text-gray-600 mb-6">
              Match colored tiles! Catch emojis for bonus points & time!
            </p>

            {/* Collection stats from previous sessions */}
            {game.collection.stats.uniqueCount > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Your Collection
                </h3>
                <div className="flex justify-center gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {game.collection.stats.uniqueCount}
                    </div>
                    <div className="text-sm text-gray-600">Emojis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {game.collection.stats.totalCollected}
                    </div>
                    <div className="text-sm text-gray-600">Collections</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        (game.collection.stats.uniqueCount / game.totalEmojis) * 100
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
                <button
                  onClick={handleOpenGallery}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <BookOpen className="inline w-4 h-4 mr-2" />
                  View Collection
                </button>
              </div>
            )}

            <button
              onClick={game.startGame}
              className="px-8 py-4 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {/* ===== PLAYING & ENDED STATES: Game Interface ===== */}
        {game.gameState !== game.GAME_STATES.WAITING && (
          <>
            {/* Top Stats Bar */}
            <div className="flex justify-between mb-4">
              {/* Left side: Volume + Stats */}
              <div className="flex gap-3">
                <VolumeControl />

                <GameStats
                  score={game.score}
                  highScore={game.highScore}
                  streak={game.streak}
                  multiplier={game.multiplier}
                  config={GAME_CONFIG}
                />
              </div>

              {/* Right side: Collection + Time */}
              <div className="flex gap-2">
                {/* Collection count badge */}
                {game.collection.stats.uniqueCount > 0 && (
                  <Badge
                    onClick={handleOpenGallery}
                    variant="secondary"
                    className="text-lg cursor-pointer hover:bg-blue-200 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    {game.collection.stats.uniqueCount}/{game.totalEmojis}
                  </Badge>
                )}

                {/* Time remaining */}
                <TimeDisplay timeLeft={game.timeLeft} config={GAME_CONFIG} />
              </div>
            </div>

            {/* Game Board - Grid of hybrid tiles */}
            <div className="grid grid-cols-4 gap-4">
              {game.currentTiles.map((tile, index) => (
                <HybridTile
                  key={tile.id}
                  tile={tile}
                  index={index}
                  showAnimation={game.matchAnimation === index}
                  onClick={game.handleTileClick}
                />
              ))}
            </div>

            {/* Helper text */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Match tiles by color & shape!</p>
              <p className="text-xs mt-1">
                Catch matching emojis for +10s time & collection bonus! 🎯
              </p>
            </div>

            {/* ===== ENDED STATE: Game Over Overlay ===== */}
            {game.gameState === game.GAME_STATES.ENDED && (
              <GameOverScreen
                highScore={game.highScore}
                onPlayAgain={game.startGame}
                config={GAME_CONFIG}
              />
            )}
          </>
        )}
      </Card>

      {/* Collection Gallery Modal */}
      <CollectionGallery
        collection={game.collection}
        totalEmojis={game.totalEmojis}
        isOpen={showGallery}
        onClose={handleCloseGallery}
      />
    </>
  );
};

export default EndlessMatch;
