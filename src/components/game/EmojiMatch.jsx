/**
 * EmojiMatch - Emoji Collection Game Component
 *
 * Main orchestrator for the emoji collection game mode.
 * This is a variant of EndlessMatch that uses emojis instead of colored tiles.
 *
 * Key differences from EndlessMatch:
 * - No global timer (endless gameplay)
 * - Emojis spawn and expire with individual lifetimes
 * - Collection tracking and persistence
 * - Progression-based difficulty scaling
 * - Collection gallery viewer
 *
 * Game flow:
 * 1. Player starts with empty board
 * 2. Emojis spawn randomly with rarity-based lifetimes
 * 3. Player matches pairs before they expire
 * 4. Successful matches add to collection
 * 5. Game continues endlessly (player quits when done)
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useSound } from '../../context/SoundContext';
import { useEmojiGameLogic } from '../../hooks/useEmojiGameLogic';
import EmojiTile from './EmojiTile';
import CollectionFlare from './CollectionFlare';
import CollectionGallery from './CollectionGallery';
import VolumeControl from './VolumeControl';
import { Trophy, Star, TrendingUp, BookOpen, LogOut } from 'lucide-react';
import { hasCollected } from '../../utils/collectionStorage';

/**
 * Emoji Match Game Component
 *
 * @returns {JSX.Element} Complete emoji collection game
 */
const EmojiMatch = () => {
  // ==================== HOOKS ====================

  /**
   * Sound manager for audio feedback
   */
  const soundManager = useSound();

  /**
   * Game logic hook (emoji-specific)
   */
  const game = useEmojiGameLogic(soundManager);

  /**
   * Collection gallery modal state
   */
  const [showGallery, setShowGallery] = useState(false);

  // ==================== HANDLERS ====================

  /**
   * Open collection gallery
   */
  const handleOpenGallery = () => {
    soundManager.playSound('tileClick');
    setShowGallery(true);
  };

  /**
   * Close collection gallery
   */
  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  /**
   * Quit game and return to welcome screen
   */
  const handleQuitGame = () => {
    if (window.confirm('Are you sure you want to quit? Your collection will be saved!')) {
      game.quitGame();
    }
  };

  // ==================== RENDER ====================

  return (
    <>
      <Card className="p-6 max-w-2xl mx-auto relative overflow-hidden">
        {/* ===== WAITING STATE: Welcome Screen ===== */}
        {game.gameState === game.GAME_STATES.WAITING && (
          <div className="text-center">
            {/* Game Title */}
            <h1 className="text-3xl font-bold mb-2">🎮 Emoji Collection 🎮</h1>
            <p className="text-gray-600 mb-6">
              Match emoji pairs before they disappear! Build your collection!
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
                    <div className="text-sm text-gray-600">Unique Emojis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {game.collection.stats.totalCollected}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Collections
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        (game.collection.stats.uniqueCount / game.totalEmojis) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
                <Button
                  onClick={handleOpenGallery}
                  className="mt-4"
                  variant="secondary"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Collection
                </Button>
              </div>
            )}

            {/* Start button */}
            <Button onClick={game.startGame} className="px-8 py-4">
              {game.collection.stats.uniqueCount > 0
                ? 'Continue Collecting'
                : 'Start Game'}
            </Button>
          </div>
        )}

        {/* ===== PLAYING STATE: Game Interface ===== */}
        {game.gameState === game.GAME_STATES.PLAYING && (
          <>
            {/* Top Stats Bar */}
            <div className="flex justify-between mb-4">
              {/* Left side: Volume + Stats */}
              <div className="flex gap-3">
                <VolumeControl />

                {/* Score */}
                <Badge
                  variant="secondary"
                  className={`text-lg transition-transform duration-300 ${
                    game.score > game.highScore ? 'animate-bounce' : ''
                  }`}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  {game.score}
                </Badge>

                {/* Streak */}
                <Badge variant="secondary" className="text-lg">
                  <Star className="w-4 h-4 mr-1" />
                  {game.streak}x
                </Badge>

                {/* Multiplier */}
                <Badge variant="secondary" className="text-lg">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {game.multiplier.toFixed(1)}x
                </Badge>
              </div>

              {/* Right side: Collection count + Gallery button */}
              <div className="flex gap-2">
                <Badge
                  onClick={handleOpenGallery}
                  variant="secondary"
                  className="text-lg cursor-pointer hover:bg-blue-200 transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  {game.collection.stats.uniqueCount}/{game.totalEmojis}
                </Badge>

                <button
                  onClick={handleQuitGame}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                  title="Quit game"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Game Board - Grid of emoji tiles */}
            <div className="grid grid-cols-4 gap-4 relative">
              {game.currentTiles.map((tile, index) => {
                // Check if this tile should show collection flare
                const showFlare = game.collectionFlare === index;

                // Check if emoji was just collected (first time)
                const isFirstTime =
                  tile.emoji && !hasCollected(game.collection, tile.emoji);

                return (
                  <div key={tile.id} className="relative">
                    <EmojiTile
                      tile={tile}
                      index={index}
                      showFlare={showFlare}
                      onClick={game.handleTileClick}
                    />

                    {/* Collection flare overlay */}
                    {showFlare && tile.emoji && (
                      <CollectionFlare
                        emoji={tile.emoji}
                        rarity={tile.rarity}
                        isFirstTime={isFirstTime}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Helper text */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Match emoji pairs before they disappear! 🎯</p>
              <p className="text-xs mt-1">
                Rare emojis appear less often and disappear faster
              </p>
            </div>
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

export default EmojiMatch;
