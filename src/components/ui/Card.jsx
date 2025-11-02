/**
 * Card Component
 *
 * A reusable card container component for grouping related content.
 * Provides consistent white background, shadows, and rounded corners.
 *
 * Features:
 * - Clean white background with shadow
 * - Rounded corners for modern look
 * - Default padding (can be overridden)
 * - Support for custom className overrides
 * - Passes through all standard div props
 */

import React from 'react';

/**
 * Card component for content containers
 *
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {React.ReactNode} props.children - Card content
 * @param {Object} props...rest - All other props passed to div element
 * @returns {JSX.Element} Styled card container
 *
 * @example
 * <Card>
 *   <h1>Title</h1>
 *   <p>Content goes here</p>
 * </Card>
 *
 * @example
 * // With custom styling
 * <Card className="max-w-2xl mx-auto">
 *   <GameBoard />
 * </Card>
 */
export const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
