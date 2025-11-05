/**
 * EmojiTile Component
 *
 * Displays a tile in the emoji collection game.
 * Can be in one of three states:
 * 1. Empty - Shows "?" placeholder, waiting for emoji spawn
 * 2. Active - Shows emoji with animated lifetime timer ring
 * 3. Matched - Shows emoji fading out after collection
 *
 * Features:
 * - Rarity-based timer ring colors
 * - Animated countdown ring
 * - Hover effects (when active)
 * - Selection state highlight
 * - Matched state fade-out
 *
 * The timer ring animates from full circle to empty as emoji lifetime depletes.
 */

import React, { useState, useEffect } from 'react';
import { RARITY_CONFIG } from '../../config/emojiConfig';
import { getLifetimeProgress } from '../../utils/emojiManager';

/**
 * EmojiTile component
 *
 * @param {Object} props - Component props
 * @param {Object} props.tile - Tile data object
 * @param {number} props.tile.id - Unique tile identifier
 * @param {string} props.tile.emoji - Emoji character or null if empty
 * @param {string} props.tile.rarity - Rarity tier
 * @param {number} props.tile.lifetime - Total lifetime in ms
 * @param {number} props.tile.spawnedAt - Spawn timestamp
 * @param {boolean} props.tile.matched - Whether collected
 * @param {boolean} props.tile.selected - Whether selected
 * @param {number} props.index - Tile position in grid
 * @param {boolean} props.showFlare - Whether to show collection flare
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Emoji tile with timer
 */
export const EmojiTile = ({ tile, index, showFlare, onClick }) => {
  /**
   * Current lifetime progress (0-100%)
   * Updated every 50ms for smooth animation
   */
  const [progress, setProgress] = useState(100);

  /**
   * Effect: Update lifetime progress
   *
   * If tile has emoji, update progress bar every 50ms
   */
  useEffect(() => {
    if (!tile.emoji || !tile.spawnedAt || tile.matched) {
      setProgress(100);
      return;
    }

    // Initial progress
    setProgress(getLifetimeProgress(tile.spawnedAt, tile.lifetime));

    // Update progress every 50ms
    const interval = setInterval(() => {
      const newProgress = getLifetimeProgress(tile.spawnedAt, tile.lifetime);
      setProgress(newProgress);

      // Stop updating if emoji expired
      if (newProgress === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [tile.emoji, tile.spawnedAt, tile.lifetime, tile.matched]);

  /**
   * Handle tile click
   */
  const handleClick = () => {
    onClick(tile, index);
  };

  /**
   * Get rarity config for styling
   */
  const rarityConfig = tile.rarity ? RARITY_CONFIG[tile.rarity] : null;

  /**
   * Calculate stroke dash for ring animation
   * Creates the "countdown" effect
   */
  const getStrokeDasharray = () => {
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference * (1 - progress / 100);
    return `${circumference} ${circumference}`;
  };

  const getStrokeDashoffset = () => {
    const circumference = 2 * Math.PI * 45;
    return circumference * (1 - progress / 100);
  };

  /**
   * Determine tile styling classes
   */
  const tileClasses = `
    relative w-full aspect-square transition-all duration-300
    rounded-xl
    ${
      tile.emoji && !tile.matched
        ? `${rarityConfig?.bgColor} hover:scale-105 cursor-pointer`
        : 'bg-gray-100'
    }
    ${tile.matched ? 'opacity-30 scale-90' : ''}
    ${tile.selected && !tile.matched ? 'scale-110 ring-4 ring-white shadow-lg' : ''}
    ${!tile.emoji && !tile.matched ? 'border-2 border-dashed border-gray-300' : ''}
    transform active:scale-95
    flex items-center justify-center
  `;

  return (
    <div className="relative">
      {/* Main tile button */}
      <div
        onClick={handleClick}
        className={tileClasses}
        role="button"
        aria-label={
          tile.emoji
            ? `${tile.emoji} ${tile.rarity}`
            : 'Empty tile'
        }
      >
        {/* Emoji or empty state */}
        {tile.emoji ? (
          <span className="text-5xl select-none">{tile.emoji}</span>
        ) : (
          <span className="text-4xl text-gray-400 select-none">?</span>
        )}
      </div>

      {/* Timer ring (only show for active emojis) */}
      {tile.emoji && !tile.matched && rarityConfig && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={rarityConfig.color}
            strokeWidth="3"
            opacity="0.2"
          />

          {/* Animated progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={rarityConfig.color}
            strokeWidth="4"
            strokeDasharray={getStrokeDasharray()}
            strokeDashoffset={getStrokeDashoffset()}
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
            style={{
              filter: `drop-shadow(0 0 4px ${rarityConfig.color})`,
            }}
          />
        </svg>
      )}

      {/* Rarity indicator dot (small colored dot in corner) */}
      {tile.emoji && !tile.matched && rarityConfig && (
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: rarityConfig.color }}
          title={rarityConfig.label}
        />
      )}
    </div>
  );
};

export default EmojiTile;
