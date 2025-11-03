/**
 * Emoji Configuration Module
 *
 * This file contains all emoji-related configuration for the collection game.
 *
 * Key features:
 * - 200 total emojis across 3 rarity tiers
 * - Organized by theme for easy management
 * - Rarity-based lifetimes and visual styling
 * - Progression curve settings
 *
 * Structure:
 * - Common: 100 emojis (easy to find, longer lifetime)
 * - Rare: 70 emojis (harder to find, medium lifetime)
 * - Legendary: 30 emojis (very rare, short lifetime)
 */

/**
 * Emoji Pools by Rarity
 *
 * Each emoji is categorized by rarity and theme.
 * Themes help organize the large collection and could be used
 * for future features like "themed challenges" or filters.
 */
export const EMOJI_POOLS = {
  /**
   * COMMON EMOJIS (100 total)
   * - Longer lifetime (15s base)
   * - 70% spawn chance initially
   * - Everyday, recognizable emojis
   */
  common: [
    // Animals (20)
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🐤', '🦆',

    // Food & Drink (25)
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒',
    '🍑', '🍍', '🥝', '🥑', '🍅', '🥕', '🌽', '🍔',
    '🍕', '🌮', '🌯', '🍿', '🍩', '🍪', '🎂', '🍰',
    '☕',

    // Nature (15)
    '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌵', '🌲',
    '🌳', '🍀', '🌾', '🌿', '🍁', '🍂', '🌴',

    // Weather & Sky (10)
    '☀️', '🌙', '⭐', '🌟', '💫', '☁️', '⛅', '🌈',
    '❄️', '⛄',

    // Sports & Activities (15)
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
    '🏓', '🏸', '🎯', '🎮', '🎲', '🎨', '🎭',

    // Objects (15)
    '⌚', '📱', '💻', '⌨️', '🖱️', '🖨️', '📷', '📺',
    '🔋', '💡', '🔦', '📚', '📖', '✏️', '✂️',
  ],

  /**
   * RARE EMOJIS (70 total)
   * - Medium lifetime (10s base)
   * - 25% spawn chance initially
   * - Less common, more interesting emojis
   */
  rare: [
    // Fantasy Creatures (10)
    '🦄', '🐉', '🦕', '🦖', '🦈', '🐙', '🦑', '🦞',
    '🦀', '🐡',

    // Exotic Animals (15)
    '🦒', '🦘', '🦥', '🦦', '🦨', '🦡', '🦔', '🦇',
    '🦅', '🦉', '🦚', '🦜', '🦩', '🦢', '🦫',

    // Space & Planets (10)
    '🌍', '🌎', '🌏', '🪐', '🌌', '🌠', '☄️', '🚀',
    '🛸', '👽',

    // Gems & Treasures (10)
    '💎', '💍', '👑', '🏆', '🥇', '🥈', '🥉', '🎖️',
    '🏅', '⚜️',

    // Magic & Mystery (10)
    '🔮', '🎩', '🪄', '✨', '💫', '🌟', '⚡', '🔥',
    '💧', '🌊',

    // Special Foods (15)
    '🍣', '🍱', '🍜', '🍲', '🍛', '🍝', '🥘', '🥗',
    '🦞', '🦀', '🦐', '🍤', '🥟', '🍙', '🍘',
  ],

  /**
   * LEGENDARY EMOJIS (30 total)
   * - Short lifetime (6s base)
   * - 5% spawn chance initially
   * - Rarest, most special emojis
   */
  legendary: [
    // Ultimate Symbols (10)
    '👑', '💎', '🏆', '⭐', '🌟', '✨', '💫', '🔱',
    '☯️', '🕉️',

    // Mythical & Rare (10)
    '🦄', '🐉', '🧜', '🧚', '🧞', '🧙', '🧛', '🦸',
    '🦹', '👼',

    // Celestial (5)
    '☀️', '🌙', '⭐', '🌟', '💫',

    // Special Hearts & Symbols (5)
    '💖', '💝', '💗', '💓', '💞',
  ],
};

/**
 * Rarity Configuration
 *
 * Defines the characteristics of each rarity tier:
 * - Lifetime: How long emoji stays visible before disappearing
 * - Min lifetime: Minimum time even at max difficulty
 * - Color: Visual indicator color for rarity
 * - Border color: Used for timer ring
 * - Glow color: For collection flare effect
 * - Sparkle emoji: Used in collection animation
 * - Points: Base points awarded for collection
 */
export const RARITY_CONFIG = {
  /**
   * Common Rarity
   * - Most frequent spawns
   * - Longest lifetime
   * - Blue theme
   */
  common: {
    // Time-based settings
    baseLifetime: 15000,      // 15 seconds initially
    minLifetime: 3000,        // Never goes below 3 seconds

    // Visual styling
    color: '#3B82F6',         // Tailwind blue-500
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50',
    bgColor: 'bg-blue-100',

    // Collection rewards
    sparkle: '✨',            // Sparkle emoji for flare
    points: 100,              // Base points

    // Display
    label: 'Common',
    displayColor: 'text-blue-600',
  },

  /**
   * Rare Rarity
   * - Less frequent spawns
   * - Medium lifetime
   * - Purple theme
   */
  rare: {
    // Time-based settings
    baseLifetime: 10000,      // 10 seconds initially
    minLifetime: 2000,        // Never goes below 2 seconds

    // Visual styling
    color: '#8B5CF6',         // Tailwind purple-500
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50',
    bgColor: 'bg-purple-100',

    // Collection rewards
    sparkle: '🌟',            // Star emoji for flare
    points: 250,              // 2.5x common points

    // Display
    label: 'Rare',
    displayColor: 'text-purple-600',
  },

  /**
   * Legendary Rarity
   * - Very rare spawns
   * - Short lifetime (challenging!)
   * - Gold theme
   */
  legendary: {
    // Time-based settings
    baseLifetime: 6000,       // 6 seconds initially
    minLifetime: 1000,        // Never goes below 1 second

    // Visual styling
    color: '#F59E0B',         // Tailwind amber-500
    borderColor: 'border-amber-500',
    glowColor: 'shadow-amber-500/50',
    bgColor: 'bg-amber-100',

    // Collection rewards
    sparkle: '💫',            // Dizzy emoji for flare
    points: 500,              // 5x common points

    // Display
    label: 'Legendary',
    displayColor: 'text-amber-600',
  },
};

/**
 * Progression Curve Configuration
 *
 * Controls how the game difficulty increases as player collects more emojis.
 * The game becomes progressively harder but never impossible.
 *
 * Scaling factors:
 * - Lifetime reduction: Emojis disappear faster
 * - Spawn rate increase: More emojis appear more frequently
 * - Rarity shift: Better odds of rare/legendary emojis
 */
export const PROGRESSION_CONFIG = {
  /**
   * Lifetime Scaling
   * How much to reduce emoji lifetime per collection
   */
  lifetimeReduction: {
    // Milliseconds reduced per emoji collected
    perCollection: 50,

    // Maximum total reduction
    // Prevents lifetimes from becoming impossibly short
    maxReduction: {
      common: 12000,      // Max reduce by 12s (15s → 3s minimum)
      rare: 8000,         // Max reduce by 8s (10s → 2s minimum)
      legendary: 5000,    // Max reduce by 5s (6s → 1s minimum)
    },
  },

  /**
   * Spawn Rate Scaling
   * How spawn rate increases with collections
   */
  spawnRate: {
    // Base spawn rate (time between new emoji spawns)
    base: 5000,           // 5 seconds initially

    // Reduction per collection
    perCollection: 20,    // Decrease by 20ms per collection

    // Minimum spawn rate
    minimum: 2000,        // Never faster than 2 seconds
  },

  /**
   * Rarity Chance Scaling
   * How rarity distribution shifts over time
   */
  rarityShift: {
    // Initial spawn chances (percentage)
    initial: {
      common: 70,         // 70% common
      rare: 25,           // 25% rare
      legendary: 5,       // 5% legendary
    },

    // Shift per collection (percentage)
    // As player progresses, more rare/legendary emojis appear
    perCollection: {
      legendary: 0.1,     // +0.1% legendary per collection
      rare: 0.2,          // +0.2% rare per collection
    },

    // Maximum shifts
    maxShift: {
      legendary: 15,      // Max +15% (5% → 20%)
      rare: 20,           // Max +20% (25% → 45%)
    },

    // Final distribution at max progression
    // common: 40%, rare: 45%, legendary: 20%
  },

  /**
   * Active Emoji Limits
   * How many emojis can be on board at once
   */
  activeEmojis: {
    minimum: 2,           // Always at least 1 pair
    maximum: 6,           // Never more than 3 pairs
  },
};

/**
 * Get total emoji count
 * Useful for collection progress display
 */
export const getTotalEmojiCount = () => {
  return (
    EMOJI_POOLS.common.length +
    EMOJI_POOLS.rare.length +
    EMOJI_POOLS.legendary.length
  );
};

/**
 * Get all emojis as flat array
 * Useful for collection viewer
 */
export const getAllEmojis = () => {
  return [
    ...EMOJI_POOLS.common,
    ...EMOJI_POOLS.rare,
    ...EMOJI_POOLS.legendary,
  ];
};

/**
 * Get rarity of a specific emoji
 * Returns 'common', 'rare', 'legendary', or null if not found
 */
export const getEmojiRarity = (emoji) => {
  if (EMOJI_POOLS.common.includes(emoji)) return 'common';
  if (EMOJI_POOLS.rare.includes(emoji)) return 'rare';
  if (EMOJI_POOLS.legendary.includes(emoji)) return 'legendary';
  return null;
};

export default EMOJI_POOLS;
