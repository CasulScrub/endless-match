import React from 'react';

const Button = ({ className = "", children, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };  // Make sure this export is present