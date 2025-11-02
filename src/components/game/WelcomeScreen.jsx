/**
 * WelcomeScreen Component
 *
 * Initial screen shown before game starts.
 * Displays game title and start button.
 *
 * Features:
 * - Centered layout
 * - Large title
 * - Prominent start button
 * - Clean, simple design
 *
 * This screen is shown when game state is 'waiting'.
 */

import React from 'react';
import { Button } from '../ui/Button';

/**
 * Welcome screen component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onStartGame - Callback when start button is clicked
 * @returns {JSX.Element} Welcome screen with start button
 *
 * @example
 * <WelcomeScreen onStartGame={handleStartGame} />
 */
export const WelcomeScreen = ({ onStartGame }) => {
  return (
    <div className="text-center">
      {/* Game Title */}
      <h1 className="text-3xl font-bold mb-4">Endless Match</h1>

      {/* Start Button */}
      {/* Extra padding for prominence */}
      <Button onClick={onStartGame} className="px-8 py-4">
        Start Game
      </Button>
    </div>
  );
};

export default WelcomeScreen;
