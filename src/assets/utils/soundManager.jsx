import React, { createContext, useContext, useState, useCallback } from 'react';

// Import all sound effects
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

// Create context for sound management
const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // 50% volume by default

  // Initialize sounds and set up background music looping
  React.useEffect(() => {
    Object.values(soundFiles).forEach(audio => {
      audio.volume = volume;
    });
    soundFiles.backgroundMusic.loop = true;
  }, [volume]);

  // Play sound function
  const playSound = useCallback((soundName) => {
    if (!isMuted && soundFiles[soundName]) {
      // Stop the sound if it's already playing
      soundFiles[soundName].currentTime = 0;
      soundFiles[soundName].play().catch(error => {
        console.log('Error playing sound:', error);
      });
    }
  }, [isMuted]);

  // Start background music
  const startBackgroundMusic = useCallback(() => {
    if (!isMuted) {
      soundFiles.backgroundMusic.play().catch(error => {
        console.log('Error playing background music:', error);
      });
    }
  }, [isMuted]);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        // Stop all sounds including background music
        Object.values(soundFiles).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      } else {
        // Resume background music if game is in progress
        soundFiles.backgroundMusic.play().catch(console.error);
      }
      return newMuted;
    });
  }, []);

  // Clean up function to stop all sounds when component unmounts
  React.useEffect(() => {
    return () => {
      Object.values(soundFiles).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  const value = {
    playSound,
    toggleMute,
    isMuted,
    volume,
    startBackgroundMusic
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

// Custom hook for using sounds
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

// Sound effect names for type safety
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
  BACKGROUND_MUSIC: 'backgroundMusic'
};

export default SoundProvider;