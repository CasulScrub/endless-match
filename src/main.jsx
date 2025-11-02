/**
 * Application Entry Point
 *
 * This is the main entry file for the React application.
 * It renders the root App component into the DOM.
 *
 * Key features:
 * - StrictMode enabled for development warnings
 * - Renders into #root element in index.html
 * - Imports global styles from index.css
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Create React root and render the application
// StrictMode helps identify potential problems in the app during development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
