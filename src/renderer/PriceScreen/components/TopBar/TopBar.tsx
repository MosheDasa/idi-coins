declare global {
  interface Window {
    electron: any;
  }
}

import React from 'react';
import './TopBar.css';

interface TopBarProps {
  onRefresh: () => void;
}

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