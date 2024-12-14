import React from 'react';

const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };  // Make sure this export is present