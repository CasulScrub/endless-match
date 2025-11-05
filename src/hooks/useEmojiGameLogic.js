/**
 * Emoji Game Logic Custom Hook
 *
 * This hook manages the emoji collection game logic.
 * Unlike the original tile-matching game, this version:
 * - Starts with empty tiles
 * - Spawns emojis randomly with lifetimes
 * - Tracks collection progress
 * - Has no global timer (endless gameplay)
 * - Difficulty scales with collection count
 *
 * Key differences from useGameLogic:
 * - No time limit
 * - Emojis spawn/despawn continuously
 * - Collection tracking and persistence
 * - Rarity-based mechanics
 * - Progression curve difficulty scaling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_STATES } from '../config/gameConfig';
import {
  generateEmptyEmojiBoard,
  getSelectedTiles,
  findEmptyTileForSpawn,
  getActiveEmojiTiles,
  clearEmojiFromTile,
  hasTileEmojiExpired,
} from '../utils/tileGenerator';
import {
  spawnRandomEmoji,
  calculateSpawnRate,
  doEmojisMatch,
  calculateCollectionPoints,
  getTargetActiveEmojis,
} from '../utils/emojiManager';
import {
  loadCollection,
  saveCollection,
  addToCollection,
  hasCollected,
} from '../utils/collectionStorage';
import { getTotalEmojiCount } from '../config/emojiConfig';

/**
 * Custom hook for emoji collection game logic
 *
 * @param {Object} soundManager - Sound manager from useSound hook
 * @returns {Object} Game state and control functions
 */
export const useEmojiGameLogic = (soundManager) => {
  // ==================== STATE MANAGEMENT ====================

  /**
   * Current player score (session-based)
   * Resets when game restarts
   */
  const [score, setScore] = useState(0);

  /**
   * Highest score in current session
   */
  const [highScore, setHighScore] = useState(0);

  /**
   * Current streak of consecutive successful matches
   */
  const [streak, setStreak] = useState(0);

  /**
   * Current game state
   * WAITING → PLAYING (no ENDED state, game is endless)
   */
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);

  /**
   * Array of current tiles on the board
   * Each tile can be empty or have an emoji with lifetime
   */
  const [currentTiles, setCurrentTiles] = useState(generateEmptyEmojiBoard(8));

  /**
   * Current score multiplier (from quick matches)
   */
  const [multiplier, setMultiplier] = useState(1);

  /**
   * Timestamp of last successful match
   */
  const [lastMatchTime, setLastMatchTime] = useState(null);

  /**
   * Index of tile showing collection flare animation
   */
  const [collectionFlare, setCollectionFlare] = useState(null);

  /**
   * Collection data (loaded from localStorage)
   * Persists across sessions
   */
  const [collection, setCollection] = useState(loadCollection());

  /**
   * Timestamp when last emoji was spawned
   * Used to control spawn rate
   */
  const [lastSpawnTime, setLastSpawnTime] = useState(null);

  /**
   * Session start time (for play time tracking)
   */
  const sessionStartRef = useRef(null);

  /**
   * Previous high score ref for new high score detection
   */
  const prevHighScoreRef = useRef(highScore);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Shows collection flare animation on a tile
   *
   * @param {number} index - Tile index to animate
   */
  const showCollectionFlare = useCallback((index) => {
    setCollectionFlare(index);
    setTimeout(() => {
      setCollectionFlare(null);
    }, 1000); // Longer animation than match animation
  }, []);

  /**
   * Updates a tile in the tiles array
   *
   * @param {Array} tiles - Current tiles array
   * @param {number} tileId - ID of tile to update
   * @param {Object} updates - Properties to update
   * @returns {Array} Updated tiles array
   */
  const updateTile = useCallback((tiles, tileId, updates) => {
    return tiles.map((tile) =>
      tile.id === tileId ? { ...tile, ...updates } : tile
    );
  }, []);

  /**
   * Clears selections from all tiles
   *
   * @param {Array} tiles - Tiles array
   * @returns {Array} Tiles with selections cleared
   */
  const clearSelections = useCallback((tiles) => {
    return tiles.map((tile) => ({
      ...tile,
      selected: false,
    }));
  }, []);

  // ==================== EMOJI SPAWN SYSTEM ====================

  /**
   * Spawns an emoji on a random empty tile
   *
   * Creates a matching pair (2 of the same emoji) on random empty tiles.
   * Respects spawn rate and progression difficulty.
   */
  const spawnEmojiPair = useCallback(() => {
    setCurrentTiles((prevTiles) => {
      // Find empty tiles for spawning
      const emptyTile1 = findEmptyTileForSpawn(prevTiles);
      if (!emptyTile1) return prevTiles; // No empty tiles

      // Generate random emoji based on progression
      const emojiData = spawnRandomEmoji(null, collection.stats.totalCollected);

      // Spawn first emoji
      let updatedTiles = updateTile(prevTiles, emptyTile1.id, {
        emoji: emojiData.emoji,
        rarity: emojiData.rarity,
        lifetime: emojiData.lifetime,
        spawnedAt: Date.now(),
      });

      // Find second empty tile for matching pair
      const emptyTile2 = findEmptyTileForSpawn(updatedTiles);
      if (!emptyTile2) return updatedTiles; // Only one tile available

      // Spawn matching emoji
      updatedTiles = updateTile(updatedTiles, emptyTile2.id, {
        emoji: emojiData.emoji,
        rarity: emojiData.rarity,
        lifetime: emojiData.lifetime,
        spawnedAt: Date.now(),
      });

      return updatedTiles;
    });

    // Update last spawn time
    setLastSpawnTime(Date.now());

    // Play spawn sound (use tile click sound)
    soundManager.playSound('tileClick');
  }, [collection.stats.totalCollected, soundManager, updateTile]);

  /**
   * Checks and spawns emojis if needed
   *
   * Spawns based on:
   * - Current number of active emojis
   * - Time since last spawn
   * - Progression-based spawn rate
   */
  const checkAndSpawnEmojis = useCallback(() => {
    const activeEmojis = getActiveEmojiTiles(currentTiles);
    const targetActive = getTargetActiveEmojis(collection.stats.totalCollected);

    // Check if we need more emojis
    if (activeEmojis.length >= targetActive) {
      return; // Already at capacity
    }

    // Check spawn rate (time-based throttle)
    if (lastSpawnTime) {
      const timeSinceLastSpawn = Date.now() - lastSpawnTime;
      const spawnRate = calculateSpawnRate(collection.stats.totalCollected);

      if (timeSinceLastSpawn < spawnRate) {
        return; // Too soon to spawn
      }
    }

    // Spawn a new emoji pair
    spawnEmojiPair();
  }, [currentTiles, collection.stats.totalCollected, lastSpawnTime, spawnEmojiPair]);

  // ==================== EMOJI EXPIRATION SYSTEM ====================

  /**
   * Checks for and removes expired emojis
   *
   * Scans all tiles and clears emojis that have exceeded their lifetime.
   */
  const checkAndRemoveExpiredEmojis = useCallback(() => {
    setCurrentTiles((prevTiles) => {
      let hasExpired = false;

      const updatedTiles = prevTiles.map((tile) => {
        if (hasTileEmojiExpired(tile)) {
          hasExpired = true;
          return clearEmojiFromTile(tile);
        }
        return tile;
      });

      // Play expire sound if any emoji expired
      if (hasExpired) {
        soundManager.playSound('matchFail');
      }

      return updatedTiles;
    });
  }, [soundManager]);

  // ==================== GAME CONTROL FUNCTIONS ====================

  /**
   * Starts a new game session
   *
   * Initializes board and starts emoji spawning.
   * Collection persists from previous sessions.
   */
  const startGame = useCallback(() => {
    soundManager.playSound('gameStart');
    soundManager.startBackgroundMusic();

    setGameState(GAME_STATES.PLAYING);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setCurrentTiles(generateEmptyEmojiBoard(8));
    setCollectionFlare(null);
    setLastMatchTime(null);
    setLastSpawnTime(null);
    sessionStartRef.current = Date.now();

    // Load persisted collection
    setCollection(loadCollection());
  }, [soundManager]);

  /**
   * Quits current game session
   *
   * Saves play time and returns to waiting screen.
   * Collection is already saved on each collection.
   */
  const quitGame = useCallback(() => {
    if (sessionStartRef.current) {
      const playTime = Date.now() - sessionStartRef.current;
      const updatedCollection = {
        ...collection,
        stats: {
          ...collection.stats,
          playTime: collection.stats.playTime + playTime,
        },
      };
      setCollection(updatedCollection);
      saveCollection(updatedCollection);
    }

    setGameState(GAME_STATES.WAITING);
    soundManager.playSound('gameOver');
  }, [collection, soundManager]);

  // ==================== TILE INTERACTION LOGIC ====================

  /**
   * Handles successful emoji collection
   *
   * @param {Object} tile1 - First matched tile
   * @param {Object} tile2 - Second matched tile
   * @param {number} clickedIndex - Index for flare animation
   * @param {Array} tiles - Current tiles
   */
  const handleSuccessfulCollection = useCallback(
    (tile1, tile2, clickedIndex, tiles) => {
      soundManager.playSound('matchSuccess');
      showCollectionFlare(clickedIndex);

      // Mark tiles as matched (will be cleared shortly)
      let updatedTiles = updateTile(tiles, tile1.id, {
        matched: true,
        selected: true,
      });
      updatedTiles = updateTile(updatedTiles, tile2.id, {
        matched: true,
        selected: true,
      });

      // Update multiplier for quick matches
      const now = Date.now();
      if (lastMatchTime && now - lastMatchTime < 2000) {
        setMultiplier((prev) => Math.min(prev + 0.5, 4));
      }
      setLastMatchTime(now);

      // Check if this is first time collecting this emoji
      const isFirstTime = !hasCollected(collection, tile1.emoji);

      // Calculate points
      const points = calculateCollectionPoints(
        tile1.rarity,
        multiplier,
        isFirstTime
      );
      setScore((prev) => prev + points);

      // Update collection
      const updatedCollection = addToCollection(
        collection,
        tile1.emoji,
        tile1.rarity
      );
      setCollection(updatedCollection);
      saveCollection(updatedCollection);

      // Play special sound for first-time collection
      if (isFirstTime) {
        soundManager.playSound('highScore');
      }

      // Increment streak
      setStreak((prev) => {
        const newStreak = prev + 1;

        // Play streak sounds at milestones
        if (newStreak === 6) {
          soundManager.playSound('streak3x');
        } else if (newStreak === 10) {
          soundManager.playSound('streak5x');
        }

        return newStreak;
      });

      // Clear the matched tiles after animation
      setTimeout(() => {
        setCurrentTiles((prevTiles) =>
          prevTiles.map((tile) =>
            tile.id === tile1.id || tile.id === tile2.id
              ? clearEmojiFromTile(tile)
              : { ...tile, selected: false }
          )
        );
      }, 500);

      setCurrentTiles(updatedTiles);
    },
    [
      soundManager,
      showCollectionFlare,
      updateTile,
      lastMatchTime,
      collection,
      multiplier,
    ]
  );

  /**
   * Handles failed match attempt
   *
   * @param {Array} tiles - Current tiles
   */
  const handleFailedMatch = useCallback(
    (tiles) => {
      soundManager.playSound('matchFail');

      // Reset progression
      setStreak(0);
      setMultiplier(1);

      // Clear selections after delay
      setTimeout(() => {
        setCurrentTiles((prevTiles) => clearSelections(prevTiles));
      }, 500);
    },
    [soundManager, clearSelections]
  );

  /**
   * Handles tile click
   *
   * @param {Object} clickedTile - Tile that was clicked
   * @param {number} clickedIndex - Index in tiles array
   */
  const handleTileClick = useCallback(
    (clickedTile, clickedIndex) => {
      // Only allow clicks during gameplay
      if (gameState !== GAME_STATES.PLAYING) return;

      // Can't click empty tiles or matched tiles
      if (!clickedTile.emoji || clickedTile.matched) return;

      soundManager.playSound('tileClick');

      const selectedTiles = getSelectedTiles(currentTiles);

      // If already 2 selected, ignore
      if (selectedTiles.length >= 2) return;

      // Mark tile as selected
      const updatedTiles = updateTile(currentTiles, clickedTile.id, {
        selected: true,
      });
      setCurrentTiles(updatedTiles);

      // If this is second selection, check for match
      if (selectedTiles.length === 1) {
        const firstTile = selectedTiles[0];

        // Can't match same tile
        if (firstTile.id === clickedTile.id) {
          return;
        }

        // Check if emojis match
        if (doEmojisMatch(firstTile.emoji, clickedTile.emoji)) {
          // Successful collection!
          handleSuccessfulCollection(
            firstTile,
            clickedTile,
            clickedIndex,
            updatedTiles
          );
        } else {
          // Failed match
          handleFailedMatch(updatedTiles);
        }
      }
    },
    [
      gameState,
      soundManager,
      currentTiles,
      updateTile,
      handleSuccessfulCollection,
      handleFailedMatch,
    ]
  );

  // ==================== GAME LOOP EFFECT ====================

  /**
   * Main game loop
   *
   * Runs continuously during gameplay to:
   * - Check and remove expired emojis
   * - Spawn new emojis as needed
   */
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) {
      return; // Only run during active gameplay
    }

    // Run checks every 100ms
    const interval = setInterval(() => {
      checkAndRemoveExpiredEmojis();
      checkAndSpawnEmojis();
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, checkAndRemoveExpiredEmojis, checkAndSpawnEmojis]);

  /**
   * High score detection
   */
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      if (score > prevHighScoreRef.current) {
        setHighScore(score);
        prevHighScoreRef.current = score;
      }
    }
  }, [score, gameState]);

  // ==================== RETURN PUBLIC API ====================

  const totalEmojis = getTotalEmojiCount();

  return {
    // Game state
    score,
    highScore,
    streak,
    gameState,
    currentTiles,
    multiplier,
    collectionFlare,

    // Collection state
    collection,
    totalEmojis,

    // Game state constants
    GAME_STATES,

    // Control functions
    startGame,
    quitGame,
    handleTileClick,
  };
};

export default useEmojiGameLogic;
