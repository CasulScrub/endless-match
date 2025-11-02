/**
 * Button Component
 *
 * A reusable button component with consistent styling.
 * Provides a standard look and feel for all buttons in the application.
 *
 * Features:
 * - Consistent blue theme styling
 * - Smooth hover transitions
 * - Support for custom className overrides
 * - Passes through all standard button props
 */

import React from 'react';

/**
 * Button component with default styling
 *
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {React.ReactNode} props.children - Button content
 * @param {Object} props...rest - All other props passed to button element
 * @returns {JSX.Element} Styled button element
 *
 * @example
 * <Button onClick={handleClick}>
 *   Start Game
 * </Button>
 *
 * @example
 * // With custom styling
 * <Button className="px-8 py-4">
 *   Large Button
 * </Button>
 */
export const Button = ({ className = '', children, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
