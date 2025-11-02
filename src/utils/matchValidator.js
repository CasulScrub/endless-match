/**
 * Match Validator Utility Module
 *
 * This module handles all tile matching logic and validation.
 * It determines whether two tiles constitute a valid match,
 * and manages the rules for tile selection.
 *
 * Key responsibilities:
 * - Validate if two tiles match (same color and shape)
 * - Check if tiles can be selected
 * - Determine selection state validity
 *
 * All functions are pure for easy testing and debugging.
 */

/**
 * Checks if two tiles match based on their properties
 *
 * In this game, tiles match when BOTH their color AND shape are identical.
 * This creates a more challenging game than color-only matching.
 *
 * Important: This function checks visual properties only, not tile state.
 * It doesn't check if tiles are already matched or selected.
 *
 * @param {Object} tile1 - First tile to compare
 * @param {string} tile1.color - Tailwind color class (e.g., 'bg-red-500')
 * @param {string} tile1.shape - Tailwind shape class (e.g., 'rounded-full')
 * @param {Object} tile2 - Second tile to compare
 * @param {string} tile2.color - Tailwind color class
 * @param {string} tile2.shape - Tailwind shape class
 * @returns {boolean} True if tiles have matching color AND shape
 *
 * @example
 * const tile1 = { color: 'bg-red-500', shape: 'rounded-full' };
 * const tile2 = { color: 'bg-red-500', shape: 'rounded-full' };
 * doTilesMatch(tile1, tile2); // Returns true
 *
 * @example
 * // Same color, different shape - NO MATCH
 * const tile1 = { color: 'bg-red-500', shape: 'rounded-full' };
 * const tile2 = { color: 'bg-red-500', shape: 'rounded-lg' };
 * doTilesMatch(tile1, tile2); // Returns false
 *
 * @example
 * // Different color, same shape - NO MATCH
 * const tile1 = { color: 'bg-red-500', shape: 'rounded-full' };
 * const tile2 = { color: 'bg-blue-500', shape: 'rounded-full' };
 * doTilesMatch(tile1, tile2); // Returns false
 */
export const doTilesMatch = (tile1, tile2) => {
  // Both conditions must be true for a match:
  // 1. Colors must be identical (exact string match)
  // 2. Shapes must be identical (exact string match)
  return tile1.color === tile2.color && tile1.shape === tile2.shape;
};

/**
 * Checks if a tile can be selected by the player
 *
 * A tile can only be selected if it hasn't already been matched.
 * Matched tiles are effectively "removed" from play and shouldn't
 * respond to clicks.
 *
 * @param {Object} tile - The tile to check
 * @param {boolean} tile.matched - Whether the tile has been matched
 * @returns {boolean} True if tile can be selected (not matched)
 *
 * @example
 * const activeTile = { matched: false };
 * canTileBeSelected(activeTile); // Returns true
 *
 * @example
 * const matchedTile = { matched: true };
 * canTileBeSelected(matchedTile); // Returns false
 */
export const canTileBeSelected = (tile) => {
  // Tile can be selected if it's NOT matched
  // Using ! operator to negate the matched boolean
  return !tile.matched;
};

/**
 * Checks if a tile is the same as another tile (by ID)
 *
 * This prevents players from clicking the same tile twice.
 * Each tile has a unique ID, so we can use that for comparison.
 *
 * Important: This checks if it's the SAME tile instance,
 * not if tiles match visually. Use doTilesMatch() for that.
 *
 * @param {Object} tile1 - First tile
 * @param {number} tile1.id - Unique tile identifier
 * @param {Object} tile2 - Second tile
 * @param {number} tile2.id - Unique tile identifier
 * @returns {boolean} True if tiles have the same ID
 *
 * @example
 * const tile1 = { id: 5 };
 * const tile2 = { id: 5 };
 * areSameTile(tile1, tile2); // Returns true
 *
 * @example
 * const tile1 = { id: 5 };
 * const tile2 = { id: 7 };
 * areSameTile(tile1, tile2); // Returns false
 */
export const areSameTile = (tile1, tile2) => {
  return tile1.id === tile2.id;
};

/**
 * Validates if a tile click should be processed
 *
 * This is the main validation function that checks all conditions
 * for whether a tile click is valid. It prevents:
 * - Clicking matched tiles
 * - Clicking the same tile twice in a row
 * - Clicking when game is not in playing state
 *
 * @param {Object} tile - The tile being clicked
 * @param {Array<Object>} selectedTiles - Currently selected tiles
 * @param {string} gameState - Current game state
 * @returns {Object} Validation result with isValid flag and reason
 *
 * @example
 * const tile = { id: 1, matched: false };
 * const selected = [];
 * validateTileClick(tile, selected, 'playing');
 * // Returns { isValid: true, reason: null }
 *
 * @example
 * const matchedTile = { id: 1, matched: true };
 * validateTileClick(matchedTile, [], 'playing');
 * // Returns { isValid: false, reason: 'TILE_ALREADY_MATCHED' }
 */
export const validateTileClick = (tile, selectedTiles, gameState) => {
  // Check if game is in playing state
  if (gameState !== 'playing') {
    return {
      isValid: false,
      reason: 'GAME_NOT_PLAYING',
    };
  }

  // Check if tile is already matched
  if (tile.matched) {
    return {
      isValid: false,
      reason: 'TILE_ALREADY_MATCHED',
    };
  }

  // Check if tile is already selected
  if (tile.selected) {
    return {
      isValid: false,
      reason: 'TILE_ALREADY_SELECTED',
    };
  }

  // Check if player is trying to click the same tile twice
  if (selectedTiles.length > 0 && areSameTile(selectedTiles[0], tile)) {
    return {
      isValid: false,
      reason: 'SAME_TILE_CLICKED',
    };
  }

  // Check if two tiles are already selected
  if (selectedTiles.length >= 2) {
    return {
      isValid: false,
      reason: 'MAX_SELECTIONS_REACHED',
    };
  }

  // All validation checks passed
  return {
    isValid: true,
    reason: null,
  };
};

/**
 * Determines the outcome of a tile selection
 *
 * This function orchestrates the match checking logic:
 * - If it's the first selection, just mark it as selected
 * - If it's the second selection, check if tiles match
 *
 * @param {Object} clickedTile - The tile that was just clicked
 * @param {Array<Object>} selectedTiles - Previously selected tiles
 * @returns {Object} Selection outcome with type and relevant data
 *
 * @example
 * // First tile clicked
 * const outcome = processSelection({ id: 1 }, []);
 * // Returns {
 * //   type: 'FIRST_SELECTION',
 * //   tile: { id: 1 }
 * // }
 *
 * @example
 * // Second tile clicked - MATCH
 * const tile1 = { id: 1, color: 'bg-red-500', shape: 'rounded-full' };
 * const tile2 = { id: 2, color: 'bg-red-500', shape: 'rounded-full' };
 * const outcome = processSelection(tile2, [tile1]);
 * // Returns {
 * //   type: 'MATCH_SUCCESS',
 * //   tiles: [tile1, tile2]
 * // }
 *
 * @example
 * // Second tile clicked - NO MATCH
 * const tile1 = { id: 1, color: 'bg-red-500', shape: 'rounded-full' };
 * const tile2 = { id: 2, color: 'bg-blue-500', shape: 'rounded-lg' };
 * const outcome = processSelection(tile2, [tile1]);
 * // Returns {
 * //   type: 'MATCH_FAILED',
 * //   tiles: [tile1, tile2]
 * // }
 */
export const processSelection = (clickedTile, selectedTiles) => {
  // Case 1: This is the first tile selection
  if (selectedTiles.length === 0) {
    return {
      type: 'FIRST_SELECTION',
      tile: clickedTile,
    };
  }

  // Case 2: This is the second tile selection - check for match
  if (selectedTiles.length === 1) {
    const firstTile = selectedTiles[0];

    // Check if the two tiles match
    const isMatch = doTilesMatch(firstTile, clickedTile);

    if (isMatch) {
      return {
        type: 'MATCH_SUCCESS',
        tiles: [firstTile, clickedTile],
      };
    } else {
      return {
        type: 'MATCH_FAILED',
        tiles: [firstTile, clickedTile],
      };
    }
  }

  // Case 3: Unexpected state (shouldn't happen with proper validation)
  return {
    type: 'ERROR',
    reason: 'UNEXPECTED_SELECTION_STATE',
  };
};
