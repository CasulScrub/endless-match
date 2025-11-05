/**
 * GameOverScreen Component
 *
 * Screen shown when game ends (time runs out).
 * Displays final score, high score, and play again button.
 *
 * Features:
 * - Game over message
 * - High score display
 * - Play again button with bounce animation
 * - Fade-in animation
 *
 * This screen overlays the final game board state
 * so players can see how they ended.
 */

import React from 'react';
import { Button } from '../ui/Button';

/**
 * Game over screen component
 *
 * @param {Object} props - Component props
 * @param {number} props.highScore - Final high score to display
 * @param {Function} props.onPlayAgain - Callback when play again is clicked
 * @param {Function} props.onReturnToMenu - Callback when return to menu is clicked
 * @param {Object} props.config - Game configuration object
 * @param {Object} props.config.animations - Animation configuration
 * @param {string} props.config.animations.gameOverAnimation - CSS class for fade-in
 * @returns {JSX.Element} Game over screen with stats and restart button
 *
 * @example
 * <GameOverScreen
 *   highScore={1500}
 *   onPlayAgain={handlePlayAgain}
 *   onReturnToMenu={handleReturnToMenu}
 *   config={GAME_CONFIG}
 * />
 */
export const GameOverScreen = ({ highScore, onPlayAgain, onReturnToMenu, config }) => {
  return (
    <div className={`text-center mt-6 ${config.animations.gameOverAnimation}`}>
      {/* Game Over Title */}
      <h2 className="text-2xl font-bold mb-2">Game Over!</h2>

      {/* High Score Display */}
      <p className="mb-4">High Score: {highScore}</p>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {/* Play Again Button */}
        {/* Bounce animation to draw attention */}
        <Button onClick={onPlayAgain} className="animate-bounce">
          Play Again
        </Button>

        {/* Return to Menu Button */}
        <Button onClick={onReturnToMenu} variant="secondary">
          Return to Menu
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
