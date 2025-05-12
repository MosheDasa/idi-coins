declare global {
  interface Window {
    electron: any;
  }
}

import React from 'react';
import './TopBar.css';

interface TopBarProps {
  /** Callback function triggered when the refresh button is clicked */
  onRefresh: () => void;
}

/**
 * TopBar component that provides window controls and refresh functionality.
 * 
 * @component
 * @example
 * ```tsx
 * <TopBar onRefresh={() => console.log('Refreshing...')} />
 * ```
 * 
 * @param {TopBarProps} props - Component props
 * @param {() => void} props.onRefresh - Callback function for refresh button click
 * 
 * @returns {JSX.Element} A top bar with window controls and refresh button
 */
const TopBar: React.FC<TopBarProps> = ({ onRefresh }) => (
  <div className="top-bar">
    <button
      className="refresh-button"
      title="רענן"
      onClick={onRefresh}
    >
      &#x21bb;
    </button>
    <div className="window-controls">
      <button
        title="מזער"
        onClick={() => window.electron?.minimizeWindow?.()}
      >
        &#8211;
      </button>
      <button
        title="סגור"
        onClick={() => window.electron?.closeWindow?.()}
      >
        &#10005;
      </button>
    </div>
  </div>
);

export default TopBar; 