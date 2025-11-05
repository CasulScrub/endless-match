/**
 * HybridTile Component
 *
 * Displays a colored shape tile (like original game) with optional emoji overlay.
 *
 * Visual layers (bottom to top):
 * 1. Base tile - colored shape (bg-red-500, rounded-full, etc.)
 * 2. Emoji overlay - if present, shows centered on tile
 * 3. Timer ring - if emoji present, shows countdown ring
 *
 * States:
 * - Normal: Colored shape, hoverable
 * - With emoji: Colored shape + emoji + timer ring
 * - Selected: Scale up with white ring highlight
 * - Matched: Faded opacity
 */

import React, { useState, useEffect } from 'react';
import { RARITY_CONFIG } from '../../config/emojiConfig';
import { getLifetimeProgress } from '../../utils/emojiManager';

/**
 * Hybrid tile component
 *
 * @param {Object} props - Component props
 * @param {Object} props.tile - Tile data
 * @param {number} props.tile.id - Unique ID
 * @param {string} props.tile.color - Tailwind color class
 * @param {string} props.tile.shape - Tailwind shape class
 * @param {string} [props.tile.emoji] - Optional emoji overlay
 * @param {string} [props.tile.emojiRarity] - Emoji rarity
 * @param {number} [props.tile.emojiLifetime] - Emoji lifetime ms
 * @param {number} [props.tile.emojiSpawnedAt] - Emoji spawn timestamp
 * @param {boolean} props.tile.matched - If matched
 * @param {boolean} props.tile.selected - If selected
 * @param {number} props.index - Position index
 * @param {boolean} props.showAnimation - Show match animation
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Hybrid tile
 */
export const HybridTile = ({ tile, index, showAnimation, onClick }) => {
  /**
   * Emoji lifetime progress (0-100%)
   */
  const [progress, setProgress] = useState(100);

  /**
   * Update emoji timer progress
   */
  useEffect(() => {
    if (!tile.emoji || !tile.emojiSpawnedAt || tile.matched) {
      setProgress(100);
      return;
    }

    // Initial progress
    setProgress(getLifetimeProgress(tile.emojiSpawnedAt, tile.emojiLifetime));

    // Update every 50ms for smooth animation
    const interval = setInterval(() => {
      const newProgress = getLifetimeProgress(tile.emojiSpawnedAt, tile.emojiLifetime);
      setProgress(newProgress);

      if (newProgress === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [tile.emoji, tile.emojiSpawnedAt, tile.emojiLifetime, tile.matched]);

  /**
   * Handle click
   */
  const handleClick = () => {
    onClick(tile, index);
  };

  /**
   * Get rarity config for emoji styling
   */
  const rarityConfig = tile.emojiRarity ? RARITY_CONFIG[tile.emojiRarity] : null;

  /**
   * Calculate stroke dash for timer ring
   */
  const getStrokeDasharray = () => {
    const circumference = 2 * Math.PI * 45;
    return `${circumference} ${circumference}`;
  };

  const getStrokeDashoffset = () => {
    const circumference = 2 * Math.PI * 45;
    return circumference * (1 - progress / 100);
  };

  /**
   * Tile classes (original colored shape style)
   */
  const tileClasses = `
    relative w-full aspect-square transition-all duration-300
    ${tile.color}
    ${tile.shape}
    ${tile.matched ? 'opacity-50 scale-95' : 'hover:scale-110 hover:brightness-110'}
    ${tile.selected ? 'ring-4 ring-white scale-105' : ''}
    ${showAnimation ? 'animate-ping' : ''}
    transform active:scale-90
    flex items-center justify-center
  `;

  return (
    <div className="relative">
      {/* Base tile (colored shape - original style) */}
      <button
        onClick={handleClick}
        className={tileClasses}
        disabled={tile.matched}
        aria-label={`Tile ${index + 1}: ${tile.color} ${tile.shape}${
          tile.emoji ? ` with ${tile.emoji}` : ''
        }`}
      >
        {/* Emoji overlay (centered on top of colored tile) */}
        {tile.emoji && (
          <span className="text-5xl select-none absolute z-10">
            {tile.emoji}
          </span>
        )}
      </button>

      {/* Timer ring (only show if emoji present and not matched) */}
      {tile.emoji && !tile.matched && rarityConfig && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
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

      {/* Rarity indicator dot (if emoji present) */}
      {tile.emoji && !tile.matched && rarityConfig && (
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full z-30"
          style={{ backgroundColor: rarityConfig.color }}
          title={rarityConfig.label}
        />
      )}
    </div>
  );
};

export default HybridTile;
