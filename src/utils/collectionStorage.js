/**
 * Collection Storage Utility Module
 *
 * Handles persistence of emoji collection data to localStorage.
 * Allows player's collection to persist across browser sessions.
 *
 * Features:
 * - Save/load collection data
 * - Track individual emoji collection stats
 * - Store game statistics
 * - Handle localStorage errors gracefully
 *
 * Data structure stored in localStorage:
 * {
 *   collectedEmojis: {
 *     '🐶': { firstCollected: timestamp, timesCollected: 5, rarity: 'common' },
 *     '🦄': { firstCollected: timestamp, timesCollected: 1, rarity: 'legendary' }
 *   },
 *   stats: {
 *     totalCollected: 6,      // Total collections (including duplicates)
 *     uniqueCount: 2,         // Number of unique emojis
 *     totalScore: 5000,       // All-time score
 *     playTime: 3600000,      // Total play time (ms)
 *     lastPlayed: timestamp   // Last session timestamp
 *   }
 * }
 */

import { getEmojiRarity } from '../config/emojiConfig';

/**
 * Storage key for localStorage
 * Change this if you need to reset all player data
 */
const STORAGE_KEY = 'endless-match-emoji-collection';

/**
 * Default empty collection structure
 */
const DEFAULT_COLLECTION = {
  collectedEmojis: {},
  stats: {
    totalCollected: 0,
    uniqueCount: 0,
    totalScore: 0,
    playTime: 0,
    lastPlayed: null,
  },
};

/**
 * Load collection from localStorage
 *
 * Retrieves saved collection data from browser storage.
 * Returns default empty collection if no data exists or on error.
 *
 * @returns {Object} Collection data object
 *
 * @example
 * const collection = loadCollection();
 * console.log(collection.stats.uniqueCount); // 42
 */
export const loadCollection = () => {
  try {
    // Attempt to get data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);

    // If no data exists, return default
    if (!stored) {
      return { ...DEFAULT_COLLECTION };
    }

    // Parse JSON data
    const parsed = JSON.parse(stored);

    // Validate structure (ensure all required fields exist)
    if (!parsed.collectedEmojis || !parsed.stats) {
      console.warn('Invalid collection data structure, using default');
      return { ...DEFAULT_COLLECTION };
    }

    return parsed;
  } catch (error) {
    // Handle JSON parse errors or localStorage errors
    console.error('Error loading collection:', error);
    return { ...DEFAULT_COLLECTION };
  }
};

/**
 * Save collection to localStorage
 *
 * Persists collection data to browser storage.
 * Handles errors gracefully (e.g., quota exceeded).
 *
 * @param {Object} collection - Collection data to save
 * @returns {boolean} True if save successful, false otherwise
 *
 * @example
 * const success = saveCollection(myCollection);
 * if (!success) {
 *   console.error('Failed to save collection!');
 * }
 */
export const saveCollection = (collection) => {
  try {
    // Convert to JSON string
    const json = JSON.stringify(collection);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, json);

    return true;
  } catch (error) {
    // Handle errors (e.g., quota exceeded, private browsing)
    console.error('Error saving collection:', error);
    return false;
  }
};

/**
 * Add a collected emoji to the collection
 *
 * Records a new emoji collection, updating stats and tracking.
 * If emoji already collected, increments the count.
 *
 * @param {Object} collection - Current collection object
 * @param {string} emoji - Emoji that was collected
 * @param {string} rarity - Rarity tier of the emoji
 * @returns {Object} Updated collection object
 *
 * @example
 * let collection = loadCollection();
 * collection = addToCollection(collection, '🐶', 'common');
 * saveCollection(collection);
 */
export const addToCollection = (collection, emoji, rarity) => {
  // Create a copy to avoid mutations
  const updated = {
    ...collection,
    collectedEmojis: { ...collection.collectedEmojis },
    stats: { ...collection.stats },
  };

  // Check if this is first time collecting this emoji
  const isFirstTime = !updated.collectedEmojis[emoji];

  if (isFirstTime) {
    // First collection of this emoji
    updated.collectedEmojis[emoji] = {
      firstCollected: Date.now(),
      timesCollected: 1,
      rarity: rarity,
    };

    // Increment unique count
    updated.stats.uniqueCount += 1;
  } else {
    // Already collected, increment count
    updated.collectedEmojis[emoji] = {
      ...updated.collectedEmojis[emoji],
      timesCollected: updated.collectedEmojis[emoji].timesCollected + 1,
    };
  }

  // Always increment total collected
  updated.stats.totalCollected += 1;

  // Update last played timestamp
  updated.stats.lastPlayed = Date.now();

  return updated;
};

/**
 * Check if an emoji has been collected
 *
 * @param {Object} collection - Collection object
 * @param {string} emoji - Emoji to check
 * @returns {boolean} True if emoji has been collected at least once
 *
 * @example
 * if (hasCollected(collection, '🦄')) {
 *   console.log('You have the unicorn!');
 * }
 */
export const hasCollected = (collection, emoji) => {
  return !!collection.collectedEmojis[emoji];
};

/**
 * Get collection count for a specific emoji
 *
 * @param {Object} collection - Collection object
 * @param {string} emoji - Emoji to check
 * @returns {number} Number of times collected (0 if never)
 *
 * @example
 * const count = getEmojiCount(collection, '🐶');
 * console.log(`Collected ${count} times`);
 */
export const getEmojiCount = (collection, emoji) => {
  return collection.collectedEmojis[emoji]?.timesCollected || 0;
};

/**
 * Get array of all collected emojis
 *
 * @param {Object} collection - Collection object
 * @returns {Array<string>} Array of collected emoji characters
 *
 * @example
 * const collected = getCollectedEmojis(collection);
 * // Returns ['🐶', '🐱', '🦄']
 */
export const getCollectedEmojis = (collection) => {
  return Object.keys(collection.collectedEmojis);
};

/**
 * Get collection stats
 *
 * @param {Object} collection - Collection object
 * @returns {Object} Stats object
 *
 * @example
 * const stats = getCollectionStats(collection);
 * console.log(`${stats.uniqueCount} unique emojis collected`);
 */
export const getCollectionStats = (collection) => {
  return collection.stats;
};

/**
 * Update total score in collection stats
 *
 * @param {Object} collection - Collection object
 * @param {number} score - New total score
 * @returns {Object} Updated collection object
 *
 * @example
 * collection = updateTotalScore(collection, 5000);
 */
export const updateTotalScore = (collection, score) => {
  return {
    ...collection,
    stats: {
      ...collection.stats,
      totalScore: Math.max(collection.stats.totalScore, score),
    },
  };
};

/**
 * Add play time to collection stats
 *
 * @param {Object} collection - Collection object
 * @param {number} milliseconds - Time to add
 * @returns {Object} Updated collection object
 *
 * @example
 * collection = addPlayTime(collection, 60000); // Add 1 minute
 */
export const addPlayTime = (collection, milliseconds) => {
  return {
    ...collection,
    stats: {
      ...collection.stats,
      playTime: collection.stats.playTime + milliseconds,
    },
  };
};

/**
 * Reset collection (clear all data)
 *
 * Use with caution! This will delete all collection progress.
 *
 * @returns {Object} Fresh empty collection
 *
 * @example
 * const fresh = resetCollection();
 * saveCollection(fresh);
 */
export const resetCollection = () => {
  return { ...DEFAULT_COLLECTION };
};

/**
 * Export collection as JSON string
 *
 * Useful for backup or sharing collection data.
 *
 * @param {Object} collection - Collection to export
 * @returns {string} JSON string of collection
 *
 * @example
 * const backup = exportCollection(collection);
 * console.log(backup); // Copy and save somewhere
 */
export const exportCollection = (collection) => {
  return JSON.stringify(collection, null, 2);
};

/**
 * Import collection from JSON string
 *
 * Useful for restoring from backup.
 * Validates structure before returning.
 *
 * @param {string} jsonString - JSON string to import
 * @returns {Object|null} Imported collection or null if invalid
 *
 * @example
 * const imported = importCollection(backupString);
 * if (imported) {
 *   saveCollection(imported);
 * }
 */
export const importCollection = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!parsed.collectedEmojis || !parsed.stats) {
      console.error('Invalid collection structure');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error importing collection:', error);
    return null;
  }
};

/**
 * Get collection progress percentage
 *
 * @param {Object} collection - Collection object
 * @param {number} totalEmojis - Total emojis in game (e.g., 200)
 * @returns {number} Percentage collected (0-100)
 *
 * @example
 * const progress = getCollectionProgress(collection, 200);
 * console.log(`${progress}% complete!`);
 */
export const getCollectionProgress = (collection, totalEmojis) => {
  const percentage = (collection.stats.uniqueCount / totalEmojis) * 100;
  return Math.min(100, Math.round(percentage));
};

export default {
  loadCollection,
  saveCollection,
  addToCollection,
  hasCollected,
  getEmojiCount,
  getCollectedEmojis,
  getCollectionStats,
  updateTotalScore,
  addPlayTime,
  resetCollection,
  exportCollection,
  importCollection,
  getCollectionProgress,
};
