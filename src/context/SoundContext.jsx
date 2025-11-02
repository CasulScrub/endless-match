/**
 * Sound Context Module
 *
 * Provides global sound management for the application.
 * Uses React Context API to make sound functions available
 * throughout the component tree without prop drilling.
 *
 * Features:
 * - Centralized sound effect management
 * - Global mute/unmute functionality
 * - Background music control
 * - Volume control
 * - Automatic cleanup on unmount
 *
 * Sound files are loaded once and reused for better performance.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Import all sound effect audio files
 * These are loaded at module initialization
 */
const soundFiles = {
  tileClick: new Audio('/src/assets/sounds/effects/title-click.mp3'),
  matchSuccess: new Audio('/src/assets/sounds/effects/match_success.mp3'),
  matchFail: new Audio('/src/assets/sounds/effects/match_fail.mp3'),
  gameStart: new Audio('/src/assets/sounds/effects/game-start.mp3'),
  gameOver: new Audio('/src/assets/sounds/effects/game-over.mp3'),
  streak3x: new Audio('/src/assets/sounds/effects/streak-3x.mp3'),
  streak5x: new Audio('/src/assets/sounds/effects/streak-5x.mp3'),
  highScore: new Audio('/src/assets/sounds/effects/high_score.mp3'),
  boardClear: new Audio('/src/assets/sounds/effects/board-clear.mp3'),
  backgroundMusic: new Audio('/src/assets/sounds/effects/background-music.mp3'),
};

/**
 * Create context for sound management
 * This will hold the sound control functions and state
 */
const SoundContext = createContext(null);

/**
 * Sound Provider Component
 *
 * Wraps the application to provide sound functionality.
 * Should be placed high in the component tree (typically in App.jsx).
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider with sound context
 *
 * @example
 * <SoundProvider>
 *   <App />
 * </SoundProvider>
 */
export const SoundProvider = ({ children }) => {
  /**
   * Mute state
   * When true, all sounds are silenced
   */
  const [isMuted, setIsMuted] = useState(false);

  /**
   * Volume level (0.0 to 1.0)
   * Default is 50% volume for comfortable listening
   */
  const [volume, setVolume] = useState(0.5);

  /**
   * Effect: Initialize sound settings
   *
   * Sets volume for all audio files and configures
   * background music to loop continuously.
   */
  useEffect(() => {
    // Apply volume to all sound files
    Object.values(soundFiles).forEach((audio) => {
      audio.volume = volume;
    });

    // Enable looping for background music
    soundFiles.backgroundMusic.loop = true;
  }, [volume]);

  /**
   * Play a sound effect
   *
   * Plays the specified sound if not muted.
   * Resets playback to start if sound is already playing
   * (allows rapid repeated plays).
   *
   * @param {string} soundName - Name of sound to play (from soundFiles keys)
   *
   * @example
   * playSound('matchSuccess');
   * playSound('tileClick');
   */
  const playSound = useCallback(
    (soundName) => {
      // Only play if not muted and sound exists
      if (!isMuted && soundFiles[soundName]) {
        // Reset to start (allows overlapping plays)
        soundFiles[soundName].currentTime = 0;

        // Play the sound
        // Use catch to handle autoplay restrictions gracefully
        soundFiles[soundName].play().catch((error) => {
          console.log('Error playing sound:', error);
        });
      }
    },
    [isMuted]
  );

  /**
   * Start background music
   *
   * Begins playing the looping background music track.
   * Only plays if not muted.
   *
   * Note: May be blocked by browser autoplay policies.
   * Works best when called in response to user interaction.
   */
  const startBackgroundMusic = useCallback(() => {
    if (!isMuted) {
      soundFiles.backgroundMusic.play().catch((error) => {
        console.log('Error playing background music:', error);
      });
    }
  }, [isMuted]);

  /**
   * Toggle mute state
   *
   * Switches between muted and unmuted.
   * When muting: stops all currently playing sounds
   * When unmuting: resumes background music if game is active
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;

      if (newMuted) {
        // Muting: stop all sounds
        Object.values(soundFiles).forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      } else {
        // Unmuting: resume background music
        // Use catch to handle potential autoplay blocks
        soundFiles.backgroundMusic.play().catch(console.error);
      }

      return newMuted;
    });
  }, []);

  /**
   * Effect: Cleanup on unmount
   *
   * Stops and resets all audio when component unmounts.
   * Prevents sounds from continuing after app navigation/close.
   */
  useEffect(() => {
    return () => {
      Object.values(soundFiles).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  /**
   * Context value object
   * Contains all functions and state that components can use
   */
  const value = {
    playSound,
    toggleMute,
    isMuted,
    volume,
    startBackgroundMusic,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

/**
 * Custom hook for accessing sound context
 *
 * Provides easy access to sound functions in any component.
 * Includes error checking to ensure hook is used within provider.
 *
 * @returns {Object} Sound context value
 * @throws {Error} If used outside of SoundProvider
 *
 * @example
 * function MyComponent() {
 *   const { playSound, isMuted, toggleMute } = useSound();
 *
 *   return (
 *     <button onClick={() => playSound('tileClick')}>
 *       Click me
 *     </button>
 *   );
 * }
 */
export const useSound = () => {
  const context = useContext(SoundContext);

  // Ensure hook is used within provider
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }

  return context;
};

/**
 * Sound effect name constants
 *
 * Provides type-safe-ish access to sound effect names.
 * Using these constants prevents typos in sound names.
 *
 * @deprecated Use string literals instead for better clarity
 * This is kept for backward compatibility but may be removed
 */
export const SoundEffects = {
  TILE_CLICK: 'tileClick',
  MATCH_SUCCESS: 'matchSuccess',
  MATCH_FAIL: 'matchFail',
  GAME_START: 'gameStart',
  GAME_OVER: 'gameOver',
  STREAK_3X: 'streak3x',
  STREAK_5X: 'streak5x',
  HIGH_SCORE: 'highScore',
  BOARD_CLEAR: 'boardClear',
  BACKGROUND_MUSIC: 'backgroundMusic',
};

export default SoundProvider;
