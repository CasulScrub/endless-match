/**
 * GameStats Component
 *
 * Displays game statistics badges during gameplay.
 * Shows score, streak, and multiplier as individual badges.
 *
 * Features:
 * - Clean badge layout
 * - Icons for visual clarity
 * - Bounce animation when achieving new high score
 *
 * Note: This component only shows the stat badges, not the time.
 * Time is displayed separately using TimeDisplay component.
 *
 * This component is purely presentational and receives
 * all data from parent component.
 */

import React from 'react';
import { Badge } from '../ui/Badge';
import { Trophy, Star, TrendingUp } from 'lucide-react';

/**
 * Game statistics badges component
 *
 * @param {Object} props - Component props
 * @param {number} props.score - Current score
 * @param {number} props.highScore - High score for comparison
 * @param {number} props.streak - Current streak count
 * @param {number} props.multiplier - Current score multiplier
 * @param {Object} props.config - Game configuration object
 * @param {Object} props.config.animations - Animation configuration
 * @param {string} props.config.animations.highScoreAnimation - CSS class for high score
 * @returns {JSX.Element} Stats badges (score, streak, multiplier)
 *
 * @example
 * <GameStats
 *   score={1500}
 *   highScore={1000}
 *   streak={5}
 *   multiplier={2.0}
 *   config={GAME_CONFIG}
 * />
 */
export const GameStats = ({ score, highScore, streak, multiplier, config }) => {
  /**
   * Determine if high score animation should be shown
   * Shows bounce animation when current score exceeds high score
   */
  const isNewHighScore = score > highScore;

  return (
    <>
      {/* Score Badge */}
      {/* Shows bounce animation when achieving new high score */}
      <Badge
        variant="secondary"
        className={`text-lg transition-transform duration-300 ${
          isNewHighScore ? config.animations.highScoreAnimation : ''
        }`}
      >
        <Trophy className="w-4 h-4 mr-1" />
        {score}
      </Badge>

      {/* Streak Badge */}
      {/* Shows current consecutive match count */}
      <Badge variant="secondary" className="text-lg">
        <Star className="w-4 h-4 mr-1" />
        {streak}x
      </Badge>

      {/* Multiplier Badge */}
      {/* Shows current score multiplier with one decimal place */}
      <Badge variant="secondary" className="text-lg">
        <TrendingUp className="w-4 h-4 mr-1" />
        {multiplier.toFixed(1)}x
      </Badge>
    </>
  );
};

export default GameStats;
