/**
 * TimeDisplay Component
 *
 * Displays remaining time in the game with visual warnings.
 *
 * Features:
 * - Shows time in seconds with timer icon
 * - Pulse animation when time is running low
 * - Red color when time is critical
 *
 * This component is purely presentational and receives
 * time data from parent component.
 */

import React from 'react';
import { Badge } from '../ui/Badge';
import { Timer } from 'lucide-react';

/**
 * Time display component
 *
 * @param {Object} props - Component props
 * @param {number} props.timeLeft - Seconds remaining
 * @param {Object} props.config - Game configuration object
 * @param {Object} props.config.timing - Timing configuration
 * @param {number} props.config.timing.timeWarningThreshold - Time threshold for warning
 * @param {Object} props.config.animations - Animation configuration
 * @param {string} props.config.animations.timeWarning - CSS class for time warning
 * @returns {JSX.Element} Time badge with conditional warning styling
 *
 * @example
 * <TimeDisplay
 *   timeLeft={15}
 *   config={GAME_CONFIG}
 * />
 */
export const TimeDisplay = ({ timeLeft, config }) => {
  /**
   * Determine if time warning should be shown
   * Shows warning animation when time is running low
   */
  const isTimeWarning = timeLeft <= config.timing.timeWarningThreshold;

  return (
    <Badge
      variant="secondary"
      className={`text-lg ${isTimeWarning ? config.animations.timeWarning : ''}`}
    >
      <Timer className="w-4 h-4 mr-1" />
      {timeLeft}s
    </Badge>
  );
};

export default TimeDisplay;
