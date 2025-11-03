/**
 * Tile Generator Utility Module
 *
 * This module handles the creation and randomization of game tiles.
 * It provides pure functions that generate tile configurations
 * based on the game's configuration settings.
 *
 * Key responsibilities:
 * - Generate matching pairs of tiles
 * - Randomize tile positions
 * - Assign unique IDs to tiles
 */

/**
 * Generates a random element from an array
 *
 * This is a helper function used to randomly select colors and shapes.
 *
 * @param {Array} array - The array to pick a random element from
 * @returns {*} A random element from the array
 *
 * @example
 * const colors = ['red', 'blue', 'green'];
 * const randomColor = getRandomElement(colors); // Returns 'blue' (random)
 */
const getRandomElement = (array) => {
  // Generate random index between 0 and array length - 1
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

/**
 * Shuffles an array using the Fisher-Yates algorithm
 *
 * This algorithm ensures truly random shuffling by:
 * 1. Starting from the end of the array
 * 2. Swapping each element with a random element before it
 * 3. Working backwards to the start
 *
 * Time complexity: O(n)
 * Space complexity: O(1) - shuffles in place
 *
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array (does not mutate original)
 *
 * @example
 * const tiles = [1, 2, 3, 4];
 * const shuffled = shuffleArray(tiles); // Returns [3, 1, 4, 2] (random order)
 */
export const shuffleArray = (array) => {
  // Create a copy to avoid mutating the original array
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at positions i and j using array destructuring
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/**
 * Creates a tile object with the specified properties
 *
 * Each tile represents a game piece that players must match.
 * Tiles have visual properties (color, shape) and state properties
 * (matched status, selected status).
 *
 * @param {number} id - Unique identifier for the tile
 * @param {string} color - Tailwind CSS color class (e.g., 'bg-red-500')
 * @param {string} shape - Tailwind CSS border-radius class (e.g., 'rounded-full')
 * @returns {Object} A tile object with all necessary properties
 *
 * @example
 * const tile = createTile(0, 'bg-red-500', 'rounded-full');
 * // Returns: { id: 0, color: 'bg-red-500', shape: 'rounded-full', matched: false, selected: false }
 */
export const createTile = (id, color, shape) => {
  return {
    // Unique identifier for React key and tile tracking
    id,

    // Visual properties
    color, // Tailwind CSS background color class
    shape, // Tailwind CSS border-radius class

    // State properties
    matched: false, // Whether this tile has been successfully matched
    selected: false, // Whether this tile is currently selected by the player
  };
};

/**
 * Generates a complete set of tiles for the game board
 *
 * This is the main function for creating game boards. It:
 * 1. Creates pairs of matching tiles (same color and shape)
 * 2. Ensures the specified number of pairs is created
 * 3. Randomizes the tile positions on the board
 * 4. Assigns unique IDs to each tile
 *
 * Algorithm:
 * - For each pair needed:
 *   1. Randomly select a color from available colors
 *   2. Randomly select a shape from available shapes
 *   3. Create two identical tiles (a matching pair)
 *   4. Assign unique IDs (even and odd numbers for the pair)
 * - Shuffle all tiles to randomize their positions
 *
 * @param {Object} config - Game configuration object
 * @param {string[]} config.colors - Array of color classes to use
 * @param {string[]} config.shapes - Array of shape classes to use
 * @param {number} config.pairsPerBoard - Number of matching pairs to create
 * @returns {Array<Object>} Array of tile objects, randomized and ready to display
 *
 * @example
 * const config = {
 *   colors: ['bg-red-500', 'bg-blue-500'],
 *   shapes: ['rounded-full', 'rounded-lg'],
 *   pairsPerBoard: 2
 * };
 * const tiles = generateTiles(config);
 * // Returns 4 tiles (2 pairs), shuffled randomly
 * // Example result: [
 * //   { id: 0, color: 'bg-red-500', shape: 'rounded-full', matched: false },
 * //   { id: 1, color: 'bg-red-500', shape: 'rounded-full', matched: false },
 * //   { id: 2, color: 'bg-blue-500', shape: 'rounded-lg', matched: false },
 * //   { id: 3, color: 'bg-blue-500', shape: 'rounded-lg', matched: false }
 * // ]
 */
export const generateTiles = (config) => {
  const { colors, shapes, pairsPerBoard } = config;
  const tiles = [];

  // Generate the specified number of matching pairs
  for (let i = 0; i < pairsPerBoard; i++) {
    // Randomly select visual properties for this pair
    const color = getRandomElement(colors);
    const shape = getRandomElement(shapes);

    // Create two tiles with identical properties (a matching pair)
    // Use i * 2 and i * 2 + 1 to ensure unique IDs
    // Example: i=0 creates IDs 0 and 1, i=1 creates IDs 2 and 3, etc.
    const tile1 = createTile(i * 2, color, shape);
    const tile2 = createTile(i * 2 + 1, color, shape);

    // Add both tiles to the collection
    tiles.push(tile1, tile2);
  }

  // Shuffle the tiles so matching pairs aren't adjacent
  // This makes the game challenging and unpredictable
  return shuffleArray(tiles);
};

/**
 * Checks if all tiles on the board have been matched
 *
 * This is used to determine when to generate a new board.
 * When all tiles are matched, the player has cleared the board
 * and should receive a new set of tiles.
 *
 * @param {Array<Object>} tiles - Array of tile objects to check
 * @returns {boolean} True if all tiles are matched, false otherwise
 *
 * @example
 * const tiles = [
 *   { id: 0, matched: true },
 *   { id: 1, matched: true }
 * ];
 * const allMatched = areAllTilesMatched(tiles); // Returns true
 */
export const areAllTilesMatched = (tiles) => {
  // Use Array.every() to check if all tiles have matched: true
  // Returns true only if every single tile is matched
  return tiles.every((tile) => tile.matched);
};

/**
 * Gets all unmatched tiles from the board
 *
 * This is useful for:
 * - Determining which tiles are still in play
 * - Counting remaining tiles
 * - Filtering selections to only active tiles
 *
 * @param {Array<Object>} tiles - Array of all tile objects
 * @returns {Array<Object>} Array containing only unmatched tiles
 *
 * @example
 * const tiles = [
 *   { id: 0, matched: true },
 *   { id: 1, matched: false },
 *   { id: 2, matched: false }
 * ];
 * const unmatched = getUnmatchedTiles(tiles);
 * // Returns [{ id: 1, matched: false }, { id: 2, matched: false }]
 */
export const getUnmatchedTiles = (tiles) => {
  // Filter to only include tiles where matched is false
  return tiles.filter((tile) => !tile.matched);
};

/**
 * Gets all currently selected tiles from the board
 *
 * This helps track which tiles the player has clicked.
 * In the game, players can select up to 2 tiles at a time
 * to attempt a match.
 *
 * @param {Array<Object>} tiles - Array of all tile objects
 * @returns {Array<Object>} Array containing only selected tiles
 *
 * @example
 * const tiles = [
 *   { id: 0, selected: false },
 *   { id: 1, selected: true },
 *   { id: 2, selected: true }
 * ];
 * const selected = getSelectedTiles(tiles);
 * // Returns [{ id: 1, selected: true }, { id: 2, selected: true }]
 */
export const getSelectedTiles = (tiles) => {
  // Filter to only include tiles where selected is true
  return tiles.filter((tile) => tile.selected);
};

// ==================== EMOJI-BASED TILE FUNCTIONS ====================

/**
 * Creates an empty emoji tile
 *
 * Emoji tiles start empty and have emojis spawn on them over time.
 * Empty tiles display a placeholder and wait for emoji spawns.
 *
 * @param {number} id - Unique identifier for the tile
 * @returns {Object} An empty emoji tile object
 *
 * @example
 * const tile = createEmptyEmojiTile(0);
 * // Returns: {
 * //   id: 0,
 * //   emoji: null,
 * //   rarity: null,
 * //   lifetime: 0,
 * //   spawnedAt: null,
 * //   matched: false,
 * //   selected: false
 * // }
 */
export const createEmptyEmojiTile = (id) => {
  return {
    // Unique identifier for React key and tile tracking
    id,

    // Emoji properties (null when empty)
    emoji: null,        // The emoji character or null
    rarity: null,       // 'common', 'rare', 'legendary', or null
    lifetime: 0,        // Time until emoji disappears (ms)
    spawnedAt: null,    // Timestamp when emoji spawned

    // State properties
    matched: false,     // Whether this tile has been successfully matched
    selected: false,    // Whether this tile is currently selected by the player
  };
};

/**
 * Creates an emoji tile with emoji data
 *
 * Takes emoji spawn data and creates a complete tile object.
 * Used when spawning a new emoji on a tile.
 *
 * @param {number} id - Unique identifier for the tile
 * @param {Object} emojiData - Emoji data from spawnRandomEmoji()
 * @param {string} emojiData.emoji - The emoji character
 * @param {string} emojiData.rarity - Rarity tier
 * @param {number} emojiData.lifetime - Lifetime in milliseconds
 * @returns {Object} An emoji tile with emoji data
 *
 * @example
 * const emojiData = { emoji: '🐶', rarity: 'common', lifetime: 15000 };
 * const tile = createEmojiTile(0, emojiData);
 * // Returns: {
 * //   id: 0,
 * //   emoji: '🐶',
 * //   rarity: 'common',
 * //   lifetime: 15000,
 * //   spawnedAt: 1234567890,
 * //   matched: false,
 * //   selected: false
 * // }
 */
export const createEmojiTile = (id, emojiData) => {
  return {
    // Unique identifier
    id,

    // Emoji properties from spawn data
    emoji: emojiData.emoji,
    rarity: emojiData.rarity,
    lifetime: emojiData.lifetime,
    spawnedAt: Date.now(), // Record spawn time for lifetime tracking

    // State properties
    matched: false,
    selected: false,
  };
};

/**
 * Generates initial empty emoji tile board
 *
 * Creates a board full of empty tiles ready for emojis to spawn on.
 * This is the starting state for the emoji collection game.
 *
 * @param {number} tileCount - Number of tiles to create (usually 8)
 * @returns {Array<Object>} Array of empty emoji tiles
 *
 * @example
 * const tiles = generateEmptyEmojiBoard(8);
 * // Returns 8 empty tiles ready for emoji spawns
 */
export const generateEmptyEmojiBoard = (tileCount = 8) => {
  const tiles = [];

  for (let i = 0; i < tileCount; i++) {
    tiles.push(createEmptyEmojiTile(i));
  }

  return tiles;
};

/**
 * Gets all tiles that currently have emojis
 *
 * Filters to tiles with active emojis (not empty, not matched).
 * Useful for tracking how many emojis are currently on board.
 *
 * @param {Array<Object>} tiles - Array of emoji tiles
 * @returns {Array<Object>} Tiles with active emojis
 *
 * @example
 * const activeTiles = getActivEmojiTiles(tiles);
 * // Returns only tiles where emoji !== null and matched === false
 */
export const getActiveEmojiTiles = (tiles) => {
  return tiles.filter((tile) => tile.emoji !== null && !tile.matched);
};

/**
 * Gets all empty tiles available for emoji spawning
 *
 * Filters to tiles that don't have emojis and aren't matched.
 * These are the tiles where new emojis can spawn.
 *
 * @param {Array<Object>} tiles - Array of emoji tiles
 * @returns {Array<Object>} Empty, available tiles
 *
 * @example
 * const emptyTiles = getEmptyEmojiTiles(tiles);
 * // Returns tiles where emoji === null and matched === false
 */
export const getEmptyEmojiTiles = (tiles) => {
  return tiles.filter((tile) => tile.emoji === null && !tile.matched);
};

/**
 * Find an empty tile to spawn emoji on
 *
 * Randomly selects an available empty tile for emoji spawning.
 * Returns null if no empty tiles available.
 *
 * @param {Array<Object>} tiles - Array of emoji tiles
 * @returns {Object|null} Random empty tile or null if none available
 *
 * @example
 * const targetTile = findEmptyTileForSpawn(tiles);
 * if (targetTile) {
 *   // Spawn emoji on this tile
 * }
 */
export const findEmptyTileForSpawn = (tiles) => {
  const emptyTiles = getEmptyEmojiTiles(tiles);

  if (emptyTiles.length === 0) {
    return null; // No empty tiles available
  }

  // Return random empty tile
  return getRandomElement(emptyTiles);
};

/**
 * Clears emoji from a tile (returns it to empty state)
 *
 * Used when emoji expires or is collected.
 * Resets tile to empty state while preserving its ID.
 *
 * @param {Object} tile - Tile to clear
 * @returns {Object} Cleared tile
 *
 * @example
 * const clearedTile = clearEmojiFromTile(tile);
 * // Returns: { id: 0, emoji: null, rarity: null, ... }
 */
export const clearEmojiFromTile = (tile) => {
  return {
    ...tile,
    emoji: null,
    rarity: null,
    lifetime: 0,
    spawnedAt: null,
    selected: false,
    // Keep matched state and id
  };
};

/**
 * Checks if a tile has an expired emoji
 *
 * Determines if the emoji on this tile has exceeded its lifetime
 * and should disappear.
 *
 * @param {Object} tile - Tile to check
 * @returns {boolean} True if emoji should disappear
 *
 * @example
 * if (hasTileEmojiExpired(tile)) {
 *   // Remove emoji from tile
 * }
 */
export const hasTileEmojiExpired = (tile) => {
  // No emoji or no spawn time = not expired
  if (!tile.emoji || !tile.spawnedAt) {
    return false;
  }

  // Check if time elapsed exceeds lifetime
  const elapsed = Date.now() - tile.spawnedAt;
  return elapsed >= tile.lifetime;
};
