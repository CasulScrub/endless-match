/**
 * GradientBackground Component
 *
 * Renders a full-screen gradient background for the application.
 * Randomly selects from a set of calming color gradients.
 *
 * Features:
 * - Random gradient selection on each load
 * - Fixed position background (doesn't scroll)
 * - Calming pastel color schemes
 * - Semi-transparent white overlay for subtle effect
 * - Behind all other content (z-index -10)
 *
 * The gradient is chosen once on component mount and doesn't
 * change during the session, providing visual consistency.
 */

import React from 'react';

/**
 * Full-screen gradient background component
 *
 * @returns {JSX.Element} Fixed gradient background
 *
 * @example
 * <div className="relative min-h-screen">
 *   <GradientBackground />
 *   <div className="relative z-10">
 *     <App />
 *   </div>
 * </div>
 */
const GradientBackground = () => {
  /**
   * Array of calming gradient color combinations
   * Each gradient uses Tailwind CSS gradient classes
   * Colors are pastel (300 shade) for a calm, pleasant effect
   */
  const gradients = [
    // Blue to Purple - Cool and serene
    'bg-gradient-to-r from-blue-300 to-purple-300',

    // Green to Blue - Fresh and natural
    'bg-gradient-to-r from-green-300 to-blue-300',

    // Purple to Pink - Soft and playful
    'bg-gradient-to-r from-purple-300 to-pink-300',

    // Teal to Blue - Ocean-inspired calm
    'bg-gradient-to-r from-teal-300 to-blue-300',

    // Indigo to Purple - Deep and contemplative
    'bg-gradient-to-r from-indigo-300 to-purple-300',
  ];

  /**
   * Pick a random gradient from the array
   * This happens once on component mount
   */
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className="fixed inset-0 -z-10">
      {/* Main gradient layer */}
      <div className={`w-full h-full ${randomGradient}`} />

      {/* Semi-transparent white overlay */}
      {/* Softens the gradient for easier readability */}
      <div className="absolute inset-0 bg-white/30" />
    </div>
  );
};

export default GradientBackground;
