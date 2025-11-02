/**
 * Tile Component
 *
 * Represents a single tile in the matching game.
 * Handles visual representation and interaction for one tile.
 *
 * Features:
 * - Dynamic color and shape styling
 * - Visual states: normal, selected, matched
 * - Hover effects for interactive feedback
 * - Match animation with sparkle effect
 * - Disabled state when matched or game ended
 *
 * The tile communicates clicks to parent via onClick callback.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Individual tile component
 *
 * @param {Object} props - Component props
 * @param {Object} props.tile - Tile data object
 * @param {number} props.tile.id - Unique tile identifier
 * @param {string} props.tile.color - Tailwind color class
 * @param {string} props.tile.shape - Tailwind shape class
 * @param {boolean} props.tile.matched - Whether tile is matched
 * @param {boolean} props.tile.selected - Whether tile is selected
 * @param {number} props.index - Tile position in grid
 * @param {boolean} props.showAnimation - Whether to show match animation
 * @param {boolean} props.disabled - Whether tile should be disabled
 * @param {Function} props.onClick - Callback when tile is clicked
 * @returns {JSX.Element} Tile button with animations
 *
 * @example
 * <Tile
 *   tile={{ id: 0, color: 'bg-red-500', shape: 'rounded-full', matched: false }}
 *   index={0}
 *   showAnimation={false}
 *   disabled={false}
 *   onClick={(tile, index) => handleClick(tile, index)}
 * />
 */
export const Tile = ({
  tile,
  index,
  showAnimation,
  disabled,
  onClick,
}) => {
  /**
   * Handle tile click event
   * Passes tile and index back to parent component
   */
  const handleClick = () => {
    onClick(tile, index);
  };

  /**
   * Determine CSS classes based on tile state
   *
   * Base classes:
   * - Always: relative positioning, full width, square aspect ratio, transitions
   *
   * Dynamic classes:
   * - Color: From tile.color prop (e.g., 'bg-red-500')
   * - Shape: From tile.shape prop (e.g., 'rounded-full')
   * - Matched: Faded and scaled down when matched
   * - Selected: White ring highlight when selected
   * - Animation: Ping animation when match is made
   * - Hover: Scale up and brightness on hover (only when active)
   */
  const tileClasses = `
    relative w-full aspect-square transition-all duration-300
    ${tile.color}
    ${tile.shape}
    ${tile.matched ? 'opacity-50 scale-95' : 'hover:scale-110 hover:brightness-110'}
    ${tile.selected ? 'ring-4 ring-white scale-105' : ''}
    ${showAnimation ? 'animate-ping' : ''}
    transform active:scale-90
  `;

  return (
    <div className="relative">
      {/* Main tile button */}
      <button
        onClick={handleClick}
        className={tileClasses}
        disabled={disabled || tile.matched}
        aria-label={`Tile ${index + 1}: ${tile.color} ${tile.shape}`}
      />

      {/* Sparkle animation overlay */}
      {/* Shows when tile is successfully matched */}
      {showAnimation && (
        <Sparkles
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-300 animate-spin pointer-events-none"
          size={32}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Tile;
