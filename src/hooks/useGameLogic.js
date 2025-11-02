/**
 * Game Logic Custom Hook
 *
 * This hook encapsulates all game state and logic in one place.
 * By extracting logic from components, we achieve:
 * - Better separation of concerns (logic vs presentation)
 * - Easier unit testing (can test hook independently)
 * - Reusability (could be used in different UI implementations)
 * - Cleaner components (they just render and delegate to hook)
 *
 * This hook manages:
 * - All game state (score, streak, multiplier, time, tiles, etc.)
 * - Game lifecycle (start, end, reset)
 * - Tile interactions (click handling, matching)
 * - Scoring calculations
 * - Timer management
 * - Sound effect triggers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG, GAME_STATES } from '../config/gameConfig';
import { generateTiles, areAllTilesMatched, getSelectedTiles } from '../utils/tileGenerator';
import {
  calculateMatchPoints,
  calculateNewMultiplier,
  isQuickMatch,
  shouldAwardBonusTime,
  calculateBonusTime,
  calculateTimeDifference,
  getStreakSoundEffect,
  isNewHighScore,
} from '../utils/scoreCalculator';
import {
  doTilesMatch,
  canTileBeSelected,
  validateTileClick,
  processSelection,
} from '../utils/matchValidator';

/**
 * Custom hook for managing game logic and state
 *
 * This hook returns all the state and functions needed to run the game.
 * Components can use this hook to access game functionality without
 * containing any game logic themselves.
 *
 * @param {Object} soundManager - Sound manager object from useSound hook
 * @param {Function} soundManager.playSound - Function to play sound effects
 * @param {Function} soundManager.startBackgroundMusic - Function to start music
 * @returns {Object} Game state and control functions
 *
 * @example
 * function GameComponent() {
 *   const soundManager = useSound();
 *   const game = useGameLogic(soundManager);
 *
 *   return (
 *     <div>
 *       <button onClick={game.startGame}>Start</button>
 *       <div>Score: {game.score}</div>
 *     </div>
 *   );
 * }
 */
export const useGameLogic = (soundManager) => {
  // ==================== STATE MANAGEMENT ====================

  /**
   * Current player score
   * Increases with each successful match based on multiplier
   */
  const [score, setScore] = useState(0);

  /**
   * Highest score achieved in current session
   * Persists across multiple games until page refresh
   */
  const [highScore, setHighScore] = useState(0);

  /**
   * Current streak of consecutive successful matches
   * Resets to 0 when player makes a mistake
   * Used to award bonus time at intervals
   */
  const [streak, setStreak] = useState(0);

  /**
   * Time remaining in current game (seconds)
   * Counts down from startTime to 0
   * Game ends when this reaches 0
   */
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.timing.startTime);

  /**
   * Current game state
   * Possible values: 'waiting', 'playing', 'ended'
   * Controls which UI is shown and whether interactions are allowed
   */
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);

  /**
   * Array of current tiles on the board
   * Each tile has: id, color, shape, matched, selected
   */
  const [currentTiles, setCurrentTiles] = useState([]);

  /**
   * Current score multiplier
   * Increases with quick matches, resets on mistakes
   * Range: 1.0 to maxMultiplier (usually 4.0)
   */
  const [multiplier, setMultiplier] = useState(1);

  /**
   * Timestamp of last successful match
   * Used to calculate if next match is "quick" for multiplier bonus
   * Stored as milliseconds since epoch (from Date.now())
   */
  const [lastMatchTime, setLastMatchTime] = useState(null);

  /**
   * Index of tile currently showing match animation
   * Null when no animation is playing
   */
  const [matchAnimation, setMatchAnimation] = useState(null);

  /**
   * Ref to track previous high score for comparison
   * Used to detect when a new high score is achieved during gameplay
   */
  const prevHighScoreRef = useRef(highScore);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Shows a sparkle animation on a matched tile
   *
   * Sets the animation state and auto-clears it after the duration.
   * This provides visual feedback when tiles are successfully matched.
   *
   * @param {number} index - Index of the tile to animate
   */
  const showMatchAnimation = useCallback((index) => {
    setMatchAnimation(index);

    // Clear animation after configured duration
    setTimeout(() => {
      setMatchAnimation(null);
    }, GAME_CONFIG.timing.animationDuration);
  }, []);

  /**
   * Generates a new set of tiles for the board
   *
   * Uses the tile generator utility with game configuration.
   * This is called at game start and when board is cleared.
   */
  const generateNewTiles = useCallback(() => {
    return generateTiles(GAME_CONFIG.tiles);
  }, []);

  /**
   * Clears all selections from tiles
   *
   * Sets selected: false on all tiles.
   * Called after processing a match attempt (success or failure).
   *
   * @param {Array<Object>} tiles - Array of tile objects
   * @returns {Array<Object>} New array with selections cleared
   */
  const clearSelections = useCallback((tiles) => {
    return tiles.map((tile) => ({
      ...tile,
      selected: false,
    }));
  }, []);

  /**
   * Updates a tile's properties in the tiles array
   *
   * Creates a new array with the specified tile updated.
   * Used to mark tiles as selected or matched.
   *
   * @param {Array<Object>} tiles - Current tiles array
   * @param {number} tileId - ID of tile to update
   * @param {Object} updates - Properties to update on the tile
   * @returns {Array<Object>} New tiles array with update applied
   */
  const updateTile = useCallback((tiles, tileId, updates) => {
    return tiles.map((tile) =>
      tile.id === tileId ? { ...tile, ...updates } : tile
    );
  }, []);

  // ==================== GAME CONTROL FUNCTIONS ====================

  /**
   * Starts a new game
   *
   * Resets all game state to initial values and generates new tiles.
   * Also triggers game start sound and background music.
   *
   * This is called when:
   * - Player clicks "Start Game" from welcome screen
   * - Player clicks "Play Again" after game over
   */
  const startGame = useCallback(() => {
    // Play audio feedback
    soundManager.playSound('gameStart');
    soundManager.startBackgroundMusic();

    // Reset all game state
    setGameState(GAME_STATES.PLAYING);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(GAME_CONFIG.timing.startTime);
    setCurrentTiles(generateNewTiles());
    setMatchAnimation(null);
    setLastMatchTime(null);
  }, [soundManager, generateNewTiles]);

  /**
   * Handles end of game
   *
   * Sets game state to ended and updates high score if needed.
   * This is called automatically when timer reaches 0.
   */
  const endGame = useCallback(() => {
    soundManager.playSound('gameOver');
    setGameState(GAME_STATES.ENDED);

    // Update high score if current score is higher
    setHighScore((currentHigh) => Math.max(currentHigh, score));
  }, [soundManager, score]);

  // ==================== TILE INTERACTION LOGIC ====================

  /**
   * Handles a successful match
   *
   * This function processes all the effects of a successful match:
   * - Marks tiles as matched
   * - Calculates and awards points
   * - Updates streak
   * - Checks for multiplier increase
   * - Awards bonus time if streak milestone reached
   * - Generates new board if all tiles matched
   * - Plays appropriate sound effects
   *
   * @param {Object} tile1 - First matched tile
   * @param {Object} tile2 - Second matched tile
   * @param {number} clickedIndex - Index of the second tile (for animation)
   * @param {Array<Object>} tiles - Current tiles array
   */
  const handleSuccessfulMatch = useCallback(
    (tile1, tile2, clickedIndex, tiles) => {
      // Play success sound
      soundManager.playSound('matchSuccess');

      // Show sparkle animation on the clicked tile
      showMatchAnimation(clickedIndex);

      // Mark both tiles as matched
      let updatedTiles = updateTile(tiles, tile1.id, { matched: true, selected: true });
      updatedTiles = updateTile(updatedTiles, tile2.id, { matched: true, selected: true });

      // ===== MULTIPLIER CALCULATION =====
      // Check if this was a "quick match" for multiplier bonus
      const now = Date.now();
      if (lastMatchTime) {
        const timeDiff = calculateTimeDifference(lastMatchTime, now);

        // If match was quick enough, increase multiplier
        if (isQuickMatch(timeDiff, GAME_CONFIG.timing.quickMatchThreshold)) {
          setMultiplier((prev) =>
            calculateNewMultiplier(
              prev,
              GAME_CONFIG.scoring.multiplierIncrement,
              GAME_CONFIG.scoring.maxMultiplier
            )
          );
        }
      }
      setLastMatchTime(now);

      // ===== SCORING =====
      // Calculate points based on current multiplier
      const points = calculateMatchPoints(
        GAME_CONFIG.scoring.basePoints,
        multiplier
      );
      setScore((prev) => prev + points);

      // ===== STREAK TRACKING =====
      // Increment streak counter
      setStreak((prev) => {
        const newStreak = prev + 1;

        // Check if bonus time should be awarded
        if (
          shouldAwardBonusTime(newStreak, GAME_CONFIG.scoring.streakBonusInterval)
        ) {
          const bonus = calculateBonusTime(GAME_CONFIG.scoring.bonusTime);
          setTimeLeft((time) => time + bonus);
        }

        // Check for streak milestone sound effects
        const streakSound = getStreakSoundEffect(newStreak, GAME_CONFIG.scoring);
        if (streakSound) {
          soundManager.playSound(streakSound);
        }

        return newStreak;
      });

      // ===== BOARD MANAGEMENT =====
      // Check if all tiles are now matched (board cleared)
      if (areAllTilesMatched(updatedTiles)) {
        // Play board clear sound
        soundManager.playSound('boardClear');

        // Generate new board after a short delay
        // This gives time for the clear animation/sound
        setTimeout(() => {
          setCurrentTiles(generateNewTiles());
        }, GAME_CONFIG.timing.animationDuration);
      } else {
        // Not all matched yet, just clear selections after animation
        setTimeout(() => {
          setCurrentTiles((prevTiles) => clearSelections(prevTiles));
        }, GAME_CONFIG.timing.animationDuration);
      }

      // Update tiles immediately with matched status
      setCurrentTiles(updatedTiles);
    },
    [
      soundManager,
      showMatchAnimation,
      updateTile,
      lastMatchTime,
      multiplier,
      generateNewTiles,
      clearSelections,
    ]
  );

  /**
   * Handles a failed match attempt
   *
   * This function processes the effects of a failed match:
   * - Resets streak to 0
   * - Resets multiplier to 1
   * - Plays failure sound
   * - Clears selections after delay
   *
   * @param {Array<Object>} tiles - Current tiles array
   */
  const handleFailedMatch = useCallback(
    (tiles) => {
      // Play failure sound
      soundManager.playSound('matchFail');

      // Reset progression bonuses
      setStreak(0);
      setMultiplier(1);

      // Clear selections after showing them briefly
      setTimeout(() => {
        setCurrentTiles((prevTiles) => clearSelections(prevTiles));
      }, GAME_CONFIG.timing.animationDuration);
    },
    [soundManager, clearSelections]
  );

  /**
   * Handles tile click events
   *
   * This is the main entry point for tile interactions.
   * It validates the click, processes the selection, and
   * triggers appropriate game logic based on the outcome.
   *
   * Flow:
   * 1. Play click sound
   * 2. Validate if click is allowed
   * 3. Mark tile as selected
   * 4. If second tile selected, check for match
   * 5. Handle match success or failure
   *
   * @param {Object} clickedTile - The tile object that was clicked
   * @param {number} clickedIndex - Index of clicked tile in tiles array
   */
  const handleTileClick = useCallback(
    (clickedTile, clickedIndex) => {
      // Validate the click is allowed
      const selectedTiles = getSelectedTiles(currentTiles);
      const validation = validateTileClick(clickedTile, selectedTiles, gameState);

      // Ignore invalid clicks
      if (!validation.isValid) {
        return;
      }

      // Play click feedback sound
      soundManager.playSound('tileClick');

      // Mark tile as selected
      const updatedTiles = updateTile(currentTiles, clickedTile.id, {
        selected: true,
      });
      setCurrentTiles(updatedTiles);

      // Process the selection to determine outcome
      const outcome = processSelection(clickedTile, selectedTiles);

      // Handle the outcome
      if (outcome.type === 'MATCH_SUCCESS') {
        // Successful match!
        handleSuccessfulMatch(
          outcome.tiles[0],
          outcome.tiles[1],
          clickedIndex,
          updatedTiles
        );
      } else if (outcome.type === 'MATCH_FAILED') {
        // Failed match attempt
        handleFailedMatch(updatedTiles);
      }
      // For 'FIRST_SELECTION', no additional action needed
      // Tile is already marked as selected
    },
    [
      currentTiles,
      gameState,
      soundManager,
      updateTile,
      handleSuccessfulMatch,
      handleFailedMatch,
    ]
  );

  // ==================== TIMER MANAGEMENT ====================

  /**
   * Effect: Game Timer
   *
   * Manages the countdown timer during gameplay.
   * Decrements time every second and ends game when time runs out.
   *
   * Also checks for high score achievements during play.
   */
  useEffect(() => {
    // Only run timer when game is active
    if (gameState !== GAME_STATES.PLAYING) {
      return;
    }

    // Set up interval to tick every second
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Check if time has run out
        if (prev <= 1) {
          endGame();
          return 0;
        }

        // Decrement time
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on unmount or state change
    return () => clearInterval(timer);
  }, [gameState, endGame]);

  /**
   * Effect: High Score Detection
   *
   * Monitors score changes and plays sound when new high score achieved.
   * Uses a ref to track previous high score to avoid false triggers.
   */
  useEffect(() => {
    // Only check during active gameplay
    if (gameState === GAME_STATES.PLAYING) {
      // Check if we've surpassed the previous high score
      if (isNewHighScore(score, prevHighScoreRef.current)) {
        soundManager.playSound('highScore');
        prevHighScoreRef.current = score; // Update ref to new high
      }
    }
  }, [score, gameState, soundManager]);

  // ==================== RETURN PUBLIC API ====================

  /**
   * Return object containing all game state and functions
   * Components use this to access game functionality
   */
  return {
    // Game state
    score,
    highScore,
    streak,
    timeLeft,
    gameState,
    currentTiles,
    multiplier,
    matchAnimation,

    // Game state constants (for comparison in components)
    GAME_STATES,

    // Control functions
    startGame,
    handleTileClick,

    // Configuration (for UI to use)
    config: GAME_CONFIG,
  };
};

export default useGameLogic;
