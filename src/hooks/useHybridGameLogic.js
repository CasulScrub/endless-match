/**
 * Hybrid Emoji Game Logic Custom Hook
 *
 * This hook manages a hybrid tile-matching game with emoji collection bonuses.
 *
 * Game mechanics:
 * - Board has colored shape tiles (like original game)
 * - Emojis randomly spawn ON TOP of tiles as overlays
 * - Match tiles by color+shape (original matching)
 * - If matched tiles both have same emoji = COLLECTION BONUS!
 * - Emojis disappear after lifetime (timer ring shows countdown)
 * - Global timer counts down (game ends at 0)
 * - Regular matches: +bonus time
 * - Emoji matches: +MORE bonus time + add to collection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG, GAME_STATES } from '../config/gameConfig';
import { generateTiles, getSelectedTiles } from '../utils/tileGenerator';
import {
  calculateMatchPoints,
  calculateNewMultiplier,
  isQuickMatch,
  shouldAwardBonusTime,
  calculateTimeDifference,
  getStreakSoundEffect,
  isNewHighScore,
} from '../utils/scoreCalculator';
import {
  doTilesMatch,
} from '../utils/matchValidator';
import {
  spawnRandomEmoji,
  doEmojisMatch,
  calculateCollectionPoints,
  hasEmojiExpired,
} from '../utils/emojiManager';
import {
  loadCollection,
  saveCollection,
  addToCollection,
  hasCollected,
} from '../utils/collectionStorage';
import { getTotalEmojiCount } from '../config/emojiConfig';

/**
 * Hybrid game logic hook
 */
export const useHybridGameLogic = (soundManager) => {
  // ==================== STATE ====================

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.timing.startTime);
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);
  const [currentTiles, setCurrentTiles] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [lastMatchTime, setLastMatchTime] = useState(null);
  const [matchAnimation, setMatchAnimation] = useState(null);
  const [collection, setCollection] = useState(loadCollection());
  const [lastEmojiSpawnTime, setLastEmojiSpawnTime] = useState(null);

  const prevHighScoreRef = useRef(highScore);

  // ==================== HELPERS ====================

  const showMatchAnimation = useCallback((index) => {
    setMatchAnimation(index);
    setTimeout(() => setMatchAnimation(null), 500);
  }, []);

  const updateTile = useCallback((tiles, tileId, updates) => {
    return tiles.map((tile) =>
      tile.id === tileId ? { ...tile, ...updates } : tile
    );
  }, []);

  const clearSelections = useCallback((tiles) => {
    return tiles.map((tile) => ({ ...tile, selected: false }));
  }, []);

  // ==================== EMOJI SPAWN SYSTEM ====================

  /**
   * Spawn emoji on a random tile
   *
   * Picks a random unmatched tile and adds an emoji overlay with lifetime
   */
  const spawnEmojiOnTile = useCallback(() => {
    setCurrentTiles((prevTiles) => {
      // Find eligible tiles (not matched, no emoji currently)
      const eligibleTiles = prevTiles.filter(tile => !tile.matched && !tile.emoji);

      if (eligibleTiles.length === 0) return prevTiles;

      // Pick 2 random tiles for a matching pair
      const tile1 = eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      const remainingTiles = eligibleTiles.filter(t => t.id !== tile1.id);

      if (remainingTiles.length === 0) return prevTiles;

      const tile2 = remainingTiles[Math.floor(Math.random() * remainingTiles.length)];

      // Spawn random emoji
      const emojiData = spawnRandomEmoji(null, collection.stats.totalCollected);

      // Add emoji to both tiles
      let updatedTiles = updateTile(prevTiles, tile1.id, {
        emoji: emojiData.emoji,
        emojiRarity: emojiData.rarity,
        emojiLifetime: emojiData.lifetime,
        emojiSpawnedAt: Date.now(),
      });

      updatedTiles = updateTile(updatedTiles, tile2.id, {
        emoji: emojiData.emoji,
        emojiRarity: emojiData.rarity,
        emojiLifetime: emojiData.lifetime,
        emojiSpawnedAt: Date.now(),
      });

      return updatedTiles;
    });

    setLastEmojiSpawnTime(Date.now());
    soundManager.playSound('tileClick');
  }, [collection.stats.totalCollected, soundManager, updateTile]);

  /**
   * Check and spawn emojis periodically
   */
  const checkAndSpawnEmojis = useCallback(() => {
    // Spawn emoji every 5-10 seconds
    const spawnInterval = 5000 + Math.random() * 5000;

    if (!lastEmojiSpawnTime || Date.now() - lastEmojiSpawnTime > spawnInterval) {
      spawnEmojiOnTile();
    }
  }, [lastEmojiSpawnTime, spawnEmojiOnTile]);

  /**
   * Remove expired emojis from tiles
   */
  const checkAndRemoveExpiredEmojis = useCallback(() => {
    setCurrentTiles((prevTiles) => {
      return prevTiles.map((tile) => {
        if (tile.emoji && tile.emojiSpawnedAt &&
            hasEmojiExpired(tile.emojiSpawnedAt, tile.emojiLifetime)) {
          // Remove emoji but keep tile
          return {
            ...tile,
            emoji: null,
            emojiRarity: null,
            emojiLifetime: null,
            emojiSpawnedAt: null,
          };
        }
        return tile;
      });
    });
  }, []);

  // ==================== GAME CONTROL ====================

  const startGame = useCallback(() => {
    soundManager.playSound('gameStart');
    soundManager.startBackgroundMusic();

    setGameState(GAME_STATES.PLAYING);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(GAME_CONFIG.timing.startTime);
    setCurrentTiles(generateTiles(GAME_CONFIG.tiles));
    setMatchAnimation(null);
    setLastMatchTime(null);
    setLastEmojiSpawnTime(null);
    setCollection(loadCollection());
  }, [soundManager]);

  const endGame = useCallback(() => {
    soundManager.playSound('gameOver');
    setGameState(GAME_STATES.ENDED);
    setHighScore((currentHigh) => Math.max(currentHigh, score));
  }, [soundManager, score]);

  // ==================== MATCH HANDLING ====================

  const handleSuccessfulMatch = useCallback(
    (tile1, tile2, clickedIndex, tiles) => {
      soundManager.playSound('matchSuccess');
      showMatchAnimation(clickedIndex);

      // Mark tiles as matched
      let updatedTiles = updateTile(tiles, tile1.id, { matched: true, selected: true });
      updatedTiles = updateTile(updatedTiles, tile2.id, { matched: true, selected: true });

      // Check if this is an emoji match (both tiles have same emoji)
      const isEmojiMatch = tile1.emoji && tile2.emoji && doEmojisMatch(tile1.emoji, tile2.emoji);

      // Update multiplier
      const now = Date.now();
      if (lastMatchTime && isQuickMatch(
        calculateTimeDifference(lastMatchTime, now),
        GAME_CONFIG.timing.quickMatchThreshold
      )) {
        setMultiplier((prev) =>
          calculateNewMultiplier(
            prev,
            GAME_CONFIG.scoring.multiplierIncrement,
            GAME_CONFIG.scoring.maxMultiplier
          )
        );
      }
      setLastMatchTime(now);

      // Calculate points
      let points = calculateMatchPoints(GAME_CONFIG.scoring.basePoints, multiplier);

      // Emoji collection bonus
      if (isEmojiMatch) {
        const isFirstTime = !hasCollected(collection, tile1.emoji);
        const emojiPoints = calculateCollectionPoints(tile1.emojiRarity, multiplier, isFirstTime);
        points += emojiPoints;

        // Add to collection
        const updatedCollection = addToCollection(collection, tile1.emoji, tile1.emojiRarity);
        setCollection(updatedCollection);
        saveCollection(updatedCollection);

        // Play special sound for first-time collection
        if (isFirstTime) {
          soundManager.playSound('highScore');
        }

        // Emoji matches give MORE time bonus
        setTimeLeft((prev) => prev + 10); // +10 seconds for emoji match!
      } else {
        // Regular match gives standard time bonus
        setTimeLeft((prev) => prev + 3); // +3 seconds for regular match
      }

      setScore((prev) => prev + points);

      // Update streak
      setStreak((prev) => {
        const newStreak = prev + 1;

        // Bonus time every 5 streak
        if (shouldAwardBonusTime(newStreak, GAME_CONFIG.scoring.streakBonusInterval)) {
          setTimeLeft((time) => time + GAME_CONFIG.scoring.bonusTime);
        }

        const streakSound = getStreakSoundEffect(newStreak, GAME_CONFIG.scoring);
        if (streakSound) {
          soundManager.playSound(streakSound);
        }

        return newStreak;
      });

      // Check if board is cleared
      if (updatedTiles.every(tile => tile.matched)) {
        soundManager.playSound('boardClear');
        setTimeout(() => {
          setCurrentTiles(generateTiles(GAME_CONFIG.tiles));
        }, GAME_CONFIG.timing.animationDuration);
      } else {
        setTimeout(() => {
          setCurrentTiles((prevTiles) => clearSelections(prevTiles));
        }, GAME_CONFIG.timing.animationDuration);
      }

      setCurrentTiles(updatedTiles);
    },
    [
      soundManager,
      showMatchAnimation,
      updateTile,
      lastMatchTime,
      multiplier,
      collection,
      clearSelections,
    ]
  );

  const handleFailedMatch = useCallback(
    (tiles) => {
      soundManager.playSound('matchFail');
      setStreak(0);
      setMultiplier(1);

      setTimeout(() => {
        setCurrentTiles((prevTiles) => clearSelections(prevTiles));
      }, GAME_CONFIG.timing.animationDuration);
    },
    [soundManager, clearSelections]
  );

  const handleTileClick = useCallback(
    (clickedTile, clickedIndex) => {
      if (gameState !== GAME_STATES.PLAYING) return;

      soundManager.playSound('tileClick');

      const selectedTiles = getSelectedTiles(currentTiles);

      if (selectedTiles.length === 0) {
        // First selection
        const updatedTiles = updateTile(currentTiles, clickedTile.id, { selected: true });
        setCurrentTiles(updatedTiles);
      } else if (selectedTiles.length === 1 && selectedTiles[0].id !== clickedTile.id) {
        // Second selection
        const updatedTiles = updateTile(currentTiles, clickedTile.id, { selected: true });
        setCurrentTiles(updatedTiles);

        // Check if tiles match (by color and shape)
        if (doTilesMatch(selectedTiles[0], clickedTile)) {
          handleSuccessfulMatch(selectedTiles[0], clickedTile, clickedIndex, updatedTiles);
        } else {
          handleFailedMatch(updatedTiles);
        }
      }
    },
    [
      gameState,
      soundManager,
      currentTiles,
      updateTile,
      handleSuccessfulMatch,
      handleFailedMatch,
    ]
  );

  // ==================== GAME LOOP ====================

  /**
   * Timer countdown
   */
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endGame]);

  /**
   * Emoji spawn and expiration loop
   */
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

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
      if (isNewHighScore(score, prevHighScoreRef.current)) {
        prevHighScoreRef.current = score;
      }
    }
  }, [score, gameState]);

  // ==================== RETURN API ====================

  return {
    score,
    highScore,
    streak,
    timeLeft,
    gameState,
    currentTiles,
    multiplier,
    matchAnimation,
    collection,
    totalEmojis: getTotalEmojiCount(),
    GAME_STATES,
    startGame,
    handleTileClick,
  };
};

export default useHybridGameLogic;
