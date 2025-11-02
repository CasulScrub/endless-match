/**
 * GameBoard Component
 *
 * Displays the grid of tiles for the matching game.
 * Manages the layout and rendering of all tiles.
 *
 * Features:
 * - Responsive grid layout
 * - Configurable column count
 * - Passes click events to parent
 * - Shows animations on matched tiles
 *
 * This component is purely presentational - it receives
 * tiles and handlers from parent and renders the grid.
 */

import React from 'react';
import Tile from './Tile';

/**
 * Game board grid component
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.tiles - Array of tile objects to display
 * @param {Function} props.onTileClick - Callback when a tile is clicked
 * @param {number} props.matchAnimation - Index of tile showing animation (null if none)
 * @param {boolean} props.disabled - Whether all tiles should be disabled
 * @param {Object} props.config - Game configuration object
 * @param {Object} props.config.tiles - Tile configuration
 * @param {number} props.config.tiles.gridColumns - Number of columns in grid
 * @param {Object} props.config.ui - UI configuration
 * @param {string} props.config.ui.gridGap - Tailwind gap class
 * @returns {JSX.Element} Grid of tile components
 *
 * @example
 * <GameBoard
 *   tiles={currentTiles}
 *   onTileClick={handleTileClick}
 *   matchAnimation={2}
 *   disabled={false}
 *   config={GAME_CONFIG}
 * />
 */
export const GameBoard = ({
  tiles,
  onTileClick,
  matchAnimation,
  disabled,
  config,
}) => {
  /**
   * Build grid CSS classes from configuration
   * This allows the grid to be dynamically configured
   * without hardcoding layout values
   */
  const gridClasses = `grid grid-cols-${config.tiles.gridColumns} ${config.ui.gridGap}`;

  return (
    <div className={gridClasses}>
      {tiles.map((tile, index) => (
        <Tile
          key={tile.id}
          tile={tile}
          index={index}
          showAnimation={matchAnimation === index}
          disabled={disabled}
          onClick={onTileClick}
        />
      ))}
    </div>
  );
};

export default GameBoard;
