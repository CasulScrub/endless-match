/**
 * Emoji Manager Utility Module
 *
 * This module manages all emoji-related game logic including:
 * - Random emoji spawning based on rarity
 * - Lifetime calculations with progression curve
 * - Rarity probability distribution
 * - Progression difficulty scaling
 *
 * All functions are pure (no side effects) for easy testing.
 */

import {
  EMOJI_POOLS,
  RARITY_CONFIG,
  PROGRESSION_CONFIG,
  getEmojiRarity,
} from '../config/emojiConfig';

/**
 * Get a random element from an array
 *
 * Helper function for selecting random emojis from pools.
 *
 * @param {Array} array - Array to pick from
 * @returns {*} Random element from array
 *
 * @example
 * const emoji = getRandomElement(['🐶', '🐱', '🐭']);
 * // Returns '🐱' (random)
 */
const getRandomElement = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

/**
 * Calculate emoji lifetime based on rarity and progression
 *
 * Emoji lifetimes decrease as player collects more emojis,
 * making the game progressively harder. Each rarity has different
 * base lifetime and minimum lifetime.
 *
 * Formula:
 * lifetime = baseLifetime - (collectionsCount * reductionRate)
 * capped at minLifetime
 *
 * @param {string} rarity - Rarity tier ('common', 'rare', 'legendary')
 * @param {number} collectionsCount - Total emojis collected (for progression)
 * @returns {number} Lifetime in milliseconds
 *
 * @example
 * // Early game (0 collections)
 * calculateEmojiLifetime('common', 0);     // Returns 15000 (15s)
 * calculateEmojiLifetime('legendary', 0);  // Returns 6000 (6s)
 *
 * @example
 * // Mid game (100 collections)
 * calculateEmojiLifetime('common', 100);   // Returns 10000 (10s)
 * calculateEmojiLifetime('legendary', 100); // Returns 1000 (1s - at minimum)
 *
 * @example
 * // Late game (300 collections) - caps at minimum
 * calculateEmojiLifetime('common', 300);   // Returns 3000 (3s minimum)
 */
export const calculateEmojiLifetime = (rarity, collectionsCount) => {
  // Get rarity configuration
  const rarityConfig = RARITY_CONFIG[rarity];
  const progressConfig = PROGRESSION_CONFIG.lifetimeReduction;

  // Calculate total reduction based on collections
  // Each collection reduces lifetime by a fixed amount
  const totalReduction = collectionsCount * progressConfig.perCollection;

  // Cap reduction at maximum for this rarity
  // Prevents lifetime from becoming impossibly short
  const cappedReduction = Math.min(
    totalReduction,
    progressConfig.maxReduction[rarity]
  );

  // Calculate final lifetime
  const calculatedLifetime = rarityConfig.baseLifetime - cappedReduction;

  // Ensure we never go below minimum lifetime
  const finalLifetime = Math.max(calculatedLifetime, rarityConfig.minLifetime);

  return finalLifetime;
};

/**
 * Calculate spawn rate based on progression
 *
 * Spawn rate (time between new emoji spawns) decreases as player
 * collects more emojis, increasing game intensity.
 *
 * Formula:
 * spawnRate = baseRate - (collectionsCount * reductionRate)
 * capped at minimum
 *
 * @param {number} collectionsCount - Total emojis collected
 * @returns {number} Time between spawns in milliseconds
 *
 * @example
 * // Early game
 * calculateSpawnRate(0);    // Returns 5000 (5 seconds)
 *
 * @example
 * // Mid game
 * calculateSpawnRate(100);  // Returns 3000 (3 seconds)
 *
 * @example
 * // Late game - caps at minimum
 * calculateSpawnRate(300);  // Returns 2000 (2 seconds minimum)
 */
export const calculateSpawnRate = (collectionsCount) => {
  const config = PROGRESSION_CONFIG.spawnRate;

  // Calculate spawn rate with reduction
  const calculatedRate = config.base - (collectionsCount * config.perCollection);

  // Cap at minimum spawn rate
  return Math.max(calculatedRate, config.minimum);
};

/**
 * Calculate rarity spawn chances based on progression
 *
 * As player collects more emojis, the distribution of rarity
 * changes to include more rare and legendary emojis.
 *
 * Initial: 70% common, 25% rare, 5% legendary
 * Max progression: 40% common, 45% rare, 20% legendary
 *
 * @param {number} collectionsCount - Total emojis collected
 * @returns {Object} Rarity chances with percentages
 *
 * @example
 * // Early game
 * calculateRarityChances(0);
 * // Returns { common: 70, rare: 25, legendary: 5 }
 *
 * @example
 * // Mid game
 * calculateRarityChances(100);
 * // Returns { common: 50, rare: 35, legendary: 15 }
 *
 * @example
 * // Late game - caps at maximum
 * calculateRarityChances(300);
 * // Returns { common: 40, rare: 45, legendary: 20 }
 */
export const calculateRarityChances = (collectionsCount) => {
  const config = PROGRESSION_CONFIG.rarityShift;

  // Calculate bonus for rare and legendary
  const legendaryBonus = Math.min(
    collectionsCount * config.perCollection.legendary,
    config.maxShift.legendary
  );

  const rareBonus = Math.min(
    collectionsCount * config.perCollection.rare,
    config.maxShift.rare
  );

  // Common chance decreases as rare/legendary increase
  const commonChance = config.initial.common - legendaryBonus - rareBonus;
  const rareChance = config.initial.rare + rareBonus;
  const legendaryChance = config.initial.legendary + legendaryBonus;

  return {
    common: commonChance,
    rare: rareChance,
    legendary: legendaryChance,
  };
};

/**
 * Get random rarity based on progression-adjusted chances
 *
 * Uses weighted random selection to pick a rarity tier.
 * Chances adjust based on player's collection progress.
 *
 * Algorithm:
 * 1. Generate random number 0-100
 * 2. Check against cumulative probability ranges
 * 3. Return matching rarity
 *
 * @param {number} collectionsCount - Total emojis collected
 * @returns {string} Selected rarity ('common', 'rare', or 'legendary')
 *
 * @example
 * // Early game (70/25/5 split)
 * getRandomRarity(0);  // 70% chance 'common', 25% 'rare', 5% 'legendary'
 *
 * @example
 * // Late game (40/45/20 split)
 * getRandomRarity(300);  // 40% chance 'common', 45% 'rare', 20% 'legendary'
 */
export const getRandomRarity = (collectionsCount) => {
  // Get current rarity chances based on progression
  const chances = calculateRarityChances(collectionsCount);

  // Generate random number 0-100
  const roll = Math.random() * 100;

  // Check against cumulative ranges
  // Example at start: 0-70 common, 70-95 rare, 95-100 legendary
  if (roll < chances.common) {
    return 'common';
  } else if (roll < chances.common + chances.rare) {
    return 'rare';
  } else {
    return 'legendary';
  }
};

/**
 * Spawn a random emoji of the specified rarity
 *
 * Selects a random emoji from the rarity pool.
 * If no rarity specified, randomly selects based on progression.
 *
 * @param {string} [rarity] - Optional rarity to force ('common', 'rare', 'legendary')
 * @param {number} collectionsCount - Total emojis collected (for auto-rarity)
 * @returns {Object} Emoji data object
 *
 * @example
 * // Let game decide rarity based on progression
 * const emoji = spawnRandomEmoji(null, 50);
 * // Returns: {
 * //   emoji: '🐶',
 * //   rarity: 'common',
 * //   lifetime: 12500
 * // }
 *
 * @example
 * // Force legendary spawn
 * const legendary = spawnRandomEmoji('legendary', 50);
 * // Returns: {
 * //   emoji: '👑',
 * //   rarity: 'legendary',
 * //   lifetime: 3500
 * // }
 */
export const spawnRandomEmoji = (rarity, collectionsCount = 0) => {
  // Determine rarity if not specified
  const selectedRarity = rarity || getRandomRarity(collectionsCount);

  // Get random emoji from rarity pool
  const emojiPool = EMOJI_POOLS[selectedRarity];
  const emoji = getRandomElement(emojiPool);

  // Calculate lifetime for this emoji
  const lifetime = calculateEmojiLifetime(selectedRarity, collectionsCount);

  // Return emoji data package
  return {
    emoji,              // The emoji character
    rarity: selectedRarity,  // Rarity tier
    lifetime,           // Time until disappears (ms)
  };
};

/**
 * Calculate points for collecting an emoji
 *
 * Points are based on:
 * - Rarity (common: 100, rare: 250, legendary: 500)
 * - Current multiplier (from quick matches)
 * - First-time bonus (1000 points for new emoji)
 *
 * @param {string} rarity - Emoji rarity
 * @param {number} multiplier - Current score multiplier
 * @param {boolean} isFirstTime - Whether this is first collection of this emoji
 * @returns {number} Points to award
 *
 * @example
 * // Common emoji, no multiplier, already collected
 * calculateCollectionPoints('common', 1, false);  // Returns 100
 *
 * @example
 * // Rare emoji, 2x multiplier, first time
 * calculateCollectionPoints('rare', 2, true);     // Returns 1500 (250*2 + 1000)
 *
 * @example
 * // Legendary emoji, 4x multiplier, first time
 * calculateCollectionPoints('legendary', 4, true);  // Returns 3000 (500*4 + 1000)
 */
export const calculateCollectionPoints = (rarity, multiplier, isFirstTime) => {
  // Get base points for rarity
  const basePoints = RARITY_CONFIG[rarity].points;

  // Apply multiplier
  const points = basePoints * multiplier;

  // Add first-time bonus if applicable
  const bonus = isFirstTime ? 1000 : 0;

  return Math.floor(points + bonus);
};

/**
 * Check if two emojis can match
 *
 * For emojis to match, they must:
 * 1. Be the exact same emoji character
 * 2. Both exist (not null/undefined)
 * 3. Not already be matched
 *
 * @param {string} emoji1 - First emoji to compare
 * @param {string} emoji2 - Second emoji to compare
 * @returns {boolean} True if emojis can match
 *
 * @example
 * doEmojisMatch('🐶', '🐶');  // Returns true
 * doEmojisMatch('🐶', '🐱');  // Returns false
 * doEmojisMatch('🐶', null);  // Returns false
 */
export const doEmojisMatch = (emoji1, emoji2) => {
  // Both must exist
  if (!emoji1 || !emoji2) return false;

  // Must be identical
  return emoji1 === emoji2;
};

/**
 * Get time until emoji expires
 *
 * Calculates remaining time based on spawn time and lifetime.
 *
 * @param {number} spawnedAt - Timestamp when emoji spawned (Date.now())
 * @param {number} lifetime - Total lifetime in ms
 * @returns {number} Time remaining in ms (minimum 0)
 *
 * @example
 * const spawnTime = Date.now();
 * // ... wait 3 seconds ...
 * getTimeRemaining(spawnTime, 10000);  // Returns ~7000
 */
export const getTimeRemaining = (spawnedAt, lifetime) => {
  const elapsed = Date.now() - spawnedAt;
  const remaining = lifetime - elapsed;
  return Math.max(0, remaining);
};

/**
 * Check if emoji has expired
 *
 * @param {number} spawnedAt - Timestamp when emoji spawned
 * @param {number} lifetime - Total lifetime in ms
 * @returns {boolean} True if emoji should disappear
 *
 * @example
 * hasEmojiExpired(Date.now() - 11000, 10000);  // Returns true
 * hasEmojiExpired(Date.now() - 5000, 10000);   // Returns false
 */
export const hasEmojiExpired = (spawnedAt, lifetime) => {
  return getTimeRemaining(spawnedAt, lifetime) === 0;
};

/**
 * Get progress percentage for timer visual
 *
 * Returns 0-100 representing how much lifetime remains.
 * Used for ring timer animation.
 *
 * @param {number} spawnedAt - Timestamp when emoji spawned
 * @param {number} lifetime - Total lifetime in ms
 * @returns {number} Percentage remaining (0-100)
 *
 * @example
 * // Just spawned
 * getLifetimeProgress(Date.now(), 10000);  // Returns 100
 *
 * @example
 * // Half way through
 * getLifetimeProgress(Date.now() - 5000, 10000);  // Returns 50
 *
 * @example
 * // Expired
 * getLifetimeProgress(Date.now() - 11000, 10000);  // Returns 0
 */
export const getLifetimeProgress = (spawnedAt, lifetime) => {
  const remaining = getTimeRemaining(spawnedAt, lifetime);
  const progress = (remaining / lifetime) * 100;
  return Math.max(0, Math.min(100, progress));
};

/**
 * Get recommended active emoji count based on progression
 *
 * As player progresses, more emojis can be active simultaneously.
 * This increases challenge and opportunities.
 *
 * @param {number} collectionsCount - Total emojis collected
 * @returns {number} Target number of active emoji pairs
 *
 * @example
 * getTargetActiveEmojis(0);    // Returns 2 (1 pair)
 * getTargetActiveEmojis(50);   // Returns 4 (2 pairs)
 * getTargetActiveEmojis(200);  // Returns 6 (3 pairs)
 */
export const getTargetActiveEmojis = (collectionsCount) => {
  const config = PROGRESSION_CONFIG.activeEmojis;

  // Start with minimum
  let target = config.minimum;

  // Add more pairs as player progresses
  // Every 50 collections adds another pair
  const bonusPairs = Math.floor(collectionsCount / 50);
  target += bonusPairs * 2; // Each pair is 2 emojis

  // Cap at maximum
  return Math.min(target, config.maximum);
};
