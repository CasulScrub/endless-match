/**
 * CollectionFlare Component
 *
 * Celebratory animation shown when player collects an emoji.
 * Displays the collected emoji with sparkles and "COLLECTED!" text.
 *
 * Features:
 * - Rarity-based sparkle emoji
 * - Scale-up and fade-out animation
 * - Floats upward during animation
 * - Rarity-based color scheme
 *
 * Animation sequence:
 * 1. Appears at full scale
 * 2. Sparkles spin
 * 3. Floats upward
 * 4. Fades out
 */

import React from 'react';
import { RARITY_CONFIG } from '../../config/emojiConfig';

/**
 * Collection flare animation component
 *
 * @param {Object} props - Component props
 * @param {string} props.emoji - Emoji that was collected
 * @param {string} props.rarity - Rarity tier of emoji
 * @param {boolean} props.isFirstTime - Whether this is first collection
 * @returns {JSX.Element} Animated collection celebration
 */
export const CollectionFlare = ({ emoji, rarity, isFirstTime = false }) => {
  const rarityConfig = RARITY_CONFIG[rarity];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-collection-flare">
      <div className="flex flex-col items-center">
        {/* Sparkle emoji (spins) */}
        <div className="text-6xl animate-spin mb-2">
          {rarityConfig.sparkle}
        </div>

        {/* Collected emoji (scales up) */}
        <div className="text-7xl animate-bounce">
          {emoji}
        </div>

        {/* "COLLECTED!" text */}
        <div
          className={`text-2xl font-bold mt-2 ${rarityConfig.displayColor} animate-pulse`}
        >
          COLLECTED!
        </div>

        {/* First time bonus indicator */}
        {isFirstTime && (
          <div className="text-lg font-semibold text-yellow-600 animate-bounce mt-1">
            🎉 NEW! +1000 🎉
          </div>
        )}

        {/* Rarity label */}
        <div
          className={`text-sm font-medium mt-1 ${rarityConfig.displayColor}`}
        >
          {rarityConfig.label}
        </div>
      </div>

      {/* Background glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: rarityConfig.color }}
      />
    </div>
  );
};

export default CollectionFlare;
