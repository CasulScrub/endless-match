import React from 'react';

const GradientBackground = () => {
  // Array of calming gradient pairs
  const gradients = [
    'bg-gradient-to-r from-blue-300 to-purple-300',
    'bg-gradient-to-r from-green-300 to-blue-300',
    'bg-gradient-to-r from-purple-300 to-pink-300',
    'bg-gradient-to-r from-teal-300 to-blue-300',
    'bg-gradient-to-r from-indigo-300 to-purple-300'
  ];

  // Pick a random gradient
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className="fixed inset-0 -z-10">
      <div className={`w-full h-full ${randomGradient}`} />
      <div className="absolute inset-0 bg-white/30" />
    </div>
  );
};

export default GradientBackground;