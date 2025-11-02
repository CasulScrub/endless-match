/**
 * Game Configuration Module
 *
 * This file contains all configurable game constants and settings.
 * By centralizing configuration, we can easily:
 * - Create different difficulty levels
 * - Modify game mechanics without touching component code
 * - Create variations of the game with different rules
 * - Maintain consistent values across the codebase
 */

/**
 * Main game configuration object
 * Contains all game settings organized by category
 */
export const GAME_CONFIG = {
  /**
   * Tile Configuration
   * Defines the visual appearance and quantity of tiles
   */
  tiles: {
    // Array of Tailwind CSS background color classes for tiles
    // Each color will be used for creating matching pairs
    colors: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'],

    // Array of Tailwind CSS border-radius classes for tile shapes
    // Adds variety to tiles beyond just color matching
    shapes: ['rounded-full', 'rounded-none', 'rounded-lg', 'rounded-3xl'],

    // Number of matching pairs to generate per board
    // Total tiles = pairsPerBoard * 2
    // Example: 4 pairs = 8 tiles total
    pairsPerBoard: 4,

    // Grid layout configuration
    // Number of columns in the tile grid
    gridColumns: 4,
  },

  /**
   * Timing Configuration
   * Controls all time-based game mechanics
   */
  timing: {
    // Initial time when game starts (in seconds)
    startTime: 30,

    // Time threshold for "quick match" bonus (in milliseconds)
    // Matches made faster than this time get a multiplier boost
    quickMatchThreshold: 1000,

    // Duration of match animation effects (in milliseconds)
    // Used for visual feedback when tiles are matched
    animationDuration: 500,

    // Time warning threshold (in seconds)
    // When time remaining is less than this, show warning animation
    timeWarningThreshold: 5,
  },

  /**
   * Scoring Configuration
   * Defines how points are calculated and awarded
   */
  scoring: {
    // Base points awarded for each successful match
    // Actual points = basePoints * currentMultiplier
    basePoints: 100,

    // Maximum multiplier achievable through quick matches
    maxMultiplier: 4,

    // Amount to increase multiplier per quick match
    // Example: 1.0 + 0.5 = 1.5x, then 2.0x, etc.
    multiplierIncrement: 0.5,

    // Number of consecutive matches needed for bonus time
    // Example: Every 5 matches in a streak awards bonus time
    streakBonusInterval: 5,

    // Amount of bonus time awarded (in seconds)
    bonusTime: 5,

    // Streak threshold for 3x sound effect
    streak3xThreshold: 6,

    // Streak threshold for 5x sound effect
    streak5xThreshold: 10,
  },

  /**
   * Animation Configuration
   * CSS classes for various animation states
   */
  animations: {
    // Animation when time is running low
    timeWarning: 'animate-pulse text-red-500',

    // Animation for matched tiles
    matchedTile: 'opacity-50 scale-95',

    // Animation for selected tiles
    selectedTile: 'ring-4 ring-white scale-105',

    // Animation for match effect
    matchEffect: 'animate-ping',

    // Animation for high score achievement
    highScoreAnimation: 'animate-bounce',

    // Animation for game over screen
    gameOverAnimation: 'animate-fade-in',
  },

  /**
   * UI Configuration
   * General UI-related settings
   */
  ui: {
    // Maximum width of game container
    maxWidth: 'max-w-2xl',

    // Gap between tiles in the grid
    gridGap: 'gap-4',

    // Gap between stat badges
    badgeGap: 'gap-4',
  },
};

/**
 * Game State Constants
 * Defines possible game states for state machine
 */
export const GAME_STATES = {
  // Initial state - game has not started yet
  WAITING: 'waiting',

  // Active gameplay state
  PLAYING: 'playing',

  // Game has ended (time ran out)
  ENDED: 'ended',
};

/**
 * Default export for convenient importing
 */
export default GAME_CONFIG;
