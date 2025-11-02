/**
 * Badge Component
 *
 * A reusable badge component for displaying small pieces of information.
 * Commonly used for stats, labels, and status indicators.
 *
 * Features:
 * - Multiple visual variants (default, secondary)
 * - Flexible content (text, icons, combinations)
 * - Consistent rounded pill shape
 * - Support for custom className overrides
 */

import React from 'react';

/**
 * Badge component with variant support
 *
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.variant='default'] - Visual variant ('default' or 'secondary')
 * @param {Object} props...rest - All other props passed to span element
 * @returns {JSX.Element} Styled badge element
 *
 * @example
 * <Badge variant="secondary">
 *   100 points
 * </Badge>
 *
 * @example
 * // With icon
 * <Badge variant="secondary">
 *   <Trophy className="w-4 h-4 mr-1" />
 *   High Score
 * </Badge>
 */
export const Badge = ({ className = '', children, variant = 'default', ...props }) => {
  // Define visual styles for each variant
  const variants = {
    // Gray theme for default badges
    default: 'bg-gray-100 text-gray-800',
    // Blue theme for secondary badges (used for game stats)
    secondary: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
