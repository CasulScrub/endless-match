/**
 * VolumeControl Component
 *
 * A simple button to toggle sound on/off.
 * Shows speaker icon with visual indication of mute state.
 *
 * Features:
 * - Toggle between muted and unmuted
 * - Visual feedback with emoji icons
 * - Circular button design
 * - Integrates with sound manager context
 *
 * This component uses the useSound hook to access
 * and control the global sound state.
 */

import React from 'react';
import { useSound } from '../../context/SoundContext';

/**
 * Volume control toggle button
 *
 * @returns {JSX.Element} Volume toggle button
 *
 * @example
 * <VolumeControl />
 */
export const VolumeControl = () => {
  // Get mute state and toggle function from sound context
  const { isMuted, toggleMute } = useSound();

  return (
    <button
      onClick={toggleMute}
      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-lg hover:bg-gray-200 transition-colors"
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
    >
      {/* Show different emoji based on mute state */}
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
};

export default VolumeControl;
