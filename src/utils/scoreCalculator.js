/**
 * Score Calculator Utility Module
 *
 * This module contains all scoring-related calculations for the game.
 * By separating scoring logic from components, we can:
 * - Easily unit test scoring formulas
 * - Modify scoring mechanics without touching UI code
 * - Reuse scoring logic across different game modes
 * - Create different difficulty levels with different scoring rules
 *
 * All functions are pure (no side effects) and deterministic.
 */

/**
 * Calculates points earned for a successful match
 *
 * The scoring formula multiplies base points by the current multiplier.
 * This encourages players to build up their multiplier through quick matches.
 *
 * Formula: points = basePoints * multiplier
 *
 * @param {number} basePoints - Base points per match (from config)
 * @param {number} multiplier - Current multiplier value
 * @returns {number} Points to award for this match (rounded down to nearest integer)
 *
 * @example
 * // Basic match with no multiplier
 * calculateMatchPoints(100, 1); // Returns 100
 *
 * @example
 * // Match with 2x multiplier
 * calculateMatchPoints(100, 2); // Returns 200
 *
 * @example
 * // Match with partial multiplier
 * calculateMatchPoints(100, 1.5); // Returns 150
 */
export const calculateMatchPoints = (basePoints, multiplier) => {
  // Use Math.floor to ensure whole number points
  // This prevents floating point precision issues in scoring
  return Math.floor(basePoints * multiplier);
};

/**
 * Calculates the new multiplier after a quick match
 *
 * When players make matches quickly (faster than the threshold),
 * their multiplier increases, rewarding fast play.
 *
 * The multiplier increases by a fixed increment each quick match,
 * but is capped at a maximum value to prevent infinite scaling.
 *
 * @param {number} currentMultiplier - The player's current multiplier
 * @param {number} increment - Amount to increase multiplier by (from config)
 * @param {number} maxMultiplier - Maximum allowed multiplier (from config)
 * @returns {number} The new multiplier value (capped at maximum)
 *
 * @example
 * // Increase multiplier from 1.0 to 1.5
 * calculateNewMultiplier(1.0, 0.5, 4); // Returns 1.5
 *
 * @example
 * // Try to exceed maximum (gets capped)
 * calculateNewMultiplier(3.8, 0.5, 4); // Returns 4 (capped at max)
 */
export const calculateNewMultiplier = (
  currentMultiplier,
  increment,
  maxMultiplier
) => {
  // Add increment to current multiplier
  const newMultiplier = currentMultiplier + increment;

  // Ensure we don't exceed the maximum multiplier
  // Math.min returns the smaller of the two values
  return Math.min(newMultiplier, maxMultiplier);
};

/**
 * Determines if a match qualifies as "quick" for multiplier bonus
 *
 * Quick matches are those made faster than a threshold time.
 * This encourages rapid gameplay and rewards skilled players.
 *
 * @param {number} timeSinceLastMatch - Time since previous match (in milliseconds)
 * @param {number} threshold - Maximum time to qualify as quick (in milliseconds)
 * @returns {boolean} True if match was quick enough for bonus
 *
 * @example
 * // Fast match (800ms < 1000ms threshold)
 * isQuickMatch(800, 1000); // Returns true
 *
 * @example
 * // Slow match (1500ms > 1000ms threshold)
 * isQuickMatch(1500, 1000); // Returns false
 *
 * @example
 * // Edge case: exactly at threshold (not quick)
 * isQuickMatch(1000, 1000); // Returns false
 */
export const isQuickMatch = (timeSinceLastMatch, threshold) => {
  // Strictly less than threshold (not equal to)
  return timeSinceLastMatch < threshold;
};

/**
 * Determines if player should receive bonus time based on streak
 *
 * Players receive bonus time at regular intervals during a streak.
 * For example, every 5 consecutive matches might award +5 seconds.
 *
 * This function checks if the current streak has reached a bonus milestone.
 *
 * @param {number} streak - Current streak count
 * @param {number} interval - Matches needed between bonuses (from config)
 * @returns {boolean} True if player should receive bonus time
 *
 * @example
 * // Streak of 5, interval of 5 (bonus awarded)
 * shouldAwardBonusTime(5, 5); // Returns true
 *
 * @example
 * // Streak of 10, interval of 5 (bonus awarded)
 * shouldAwardBonusTime(10, 5); // Returns true
 *
 * @example
 * // Streak of 7, interval of 5 (no bonus)
 * shouldAwardBonusTime(7, 5); // Returns false
 *
 * @example
 * // Streak of 0 or 1 (no bonus)
 * shouldAwardBonusTime(1, 5); // Returns false
 */
export const shouldAwardBonusTime = (streak, interval) => {
  // Check if:
  // 1. Streak is greater than 0 (at least one match made)
  // 2. Streak is a multiple of the interval
  //    (using modulo operator: 5 % 5 = 0, 10 % 5 = 0, etc.)
  return streak > 0 && streak % interval === 0;
};

/**
 * Calculates bonus time to award
 *
 * This is a simple function but kept separate for consistency
 * and potential future complexity (e.g., scaling bonuses).
 *
 * @param {number} bonusTime - Base bonus time amount (from config)
 * @returns {number} Time to add (in seconds)
 *
 * @example
 * calculateBonusTime(5); // Returns 5
 */
export const calculateBonusTime = (bonusTime) => {
  return bonusTime;
};

/**
 * Calculates the time elapsed between two timestamps
 *
 * Used to determine how quickly a player made a match.
 * Returns the difference in milliseconds.
 *
 * @param {number} previousTime - Previous timestamp (from Date.now())
 * @param {number} currentTime - Current timestamp (from Date.now())
 * @returns {number} Elapsed time in milliseconds
 *
 * @example
 * const prev = 1000;
 * const current = 1850;
 * calculateTimeDifference(prev, current); // Returns 850
 */
export const calculateTimeDifference = (previousTime, currentTime) => {
  return currentTime - previousTime;
};

/**
 * Determines which streak sound effect should play
 *
 * Different sound effects trigger at different streak milestones
 * to provide audio feedback for player achievements.
 *
 * @param {number} streak - Current streak count
 * @param {Object} config - Scoring configuration with thresholds
 * @returns {string|null} Name of sound effect to play, or null if none
 *
 * @example
 * const config = { streak3xThreshold: 6, streak5xThreshold: 10 };
 * getStreakSoundEffect(6, config); // Returns 'streak3x'
 * getStreakSoundEffect(10, config); // Returns 'streak5x'
 * getStreakSoundEffect(5, config); // Returns null
 */
export const getStreakSoundEffect = (streak, config) => {
  const { streak3xThreshold, streak5xThreshold } = config;

  // Check for highest milestone first
  if (streak === streak5xThreshold) {
    return 'streak5x';
  }

  // Then check for lower milestone
  if (streak === streak3xThreshold) {
    return 'streak3x';
  }

  // No special sound effect for this streak level
  return null;
};

/**
 * Checks if a new high score has been achieved
 *
 * Used to trigger celebratory effects when player beats their record.
 *
 * @param {number} currentScore - Player's current score
 * @param {number} previousHighScore - Previous high score record
 * @returns {boolean} True if current score exceeds previous high score
 *
 * @example
 * isNewHighScore(1500, 1000); // Returns true
 * isNewHighScore(800, 1000); // Returns false
 * isNewHighScore(1000, 1000); // Returns false (must exceed, not equal)
 */
export const isNewHighScore = (currentScore, previousHighScore) => {
  return currentScore > previousHighScore;
};
