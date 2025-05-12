import React, { useEffect, useState } from 'react';
import TopBar from './components/TopBar/TopBar';
import UserCard from './components/UserCard/UserCard';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './PriceScreen.css';

interface PriceScreenProps {
  /** Callback function triggered when data is loaded */
  onDataLoaded?: () => void;
}

// Fix for Electron context
declare global {
  interface Window {
    electron: any;
  }
}

const CoinIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" />
    <text x="32" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff">₪</text>
  </svg>
);

/**
 * PriceScreen component that displays user information and handles data fetching.
 * 
 * @component
 * @example
 * ```tsx
 * <PriceScreen onDataLoaded={() => console.log('Data loaded')} />
 * ```
 * 
 * @param {PriceScreenProps} props - Component props
 * @param {() => void} [props.onDataLoaded] - Optional callback for when data is loaded
 * 
 * @returns {JSX.Element} The main price screen with user information
 */
const PriceScreen: React.FC<PriceScreenProps> = ({ onDataLoaded }) => {
  const [settings, setSettings] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load settings once on mount
  useEffect(() => {
    (async () => {
      if (window.electron?.getSettings) {
        const s = await window.electron.getSettings();
        window.electron?.writeLog?.('INFO', 'Loaded settings', { ...{ settings: s }, source: 'CLIENT' });
        setSettings(s);
      } else {
        window.electron?.writeLog?.('ERROR', 'window.electron?.getSettings is not available', { source: 'CLIENT' });
      }
    })();
  }, []);

  // Manual and automatic refresh logic
  useEffect(() => {
    if (!settings) return;
    if (!settings.apiRefreshInterval || isNaN(settings.apiRefreshInterval)) return;
    const interval = setInterval(() => {
      window.electron?.writeLog?.('DEBUG', 'Auto refresh triggered', { ...{ refreshKey }, source: 'CLIENT' });
      setRefreshKey(k => k + 1);
    }, settings.apiRefreshInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings]);

  // Fetch user only after settings are loaded or refreshKey changes
  useEffect(() => {
    window.electron?.writeLog?.('DEBUG', 'API fetch triggered', { ...{ refreshKey }, source: 'CLIENT' });
    if (!settings) {
      window.electron?.writeLog?.('ERROR', 'Settings not loaded yet, skipping API fetch', { source: 'CLIENT' });
      return;
    }
    (async () => {
      try {
        const apiUrl = (settings.apiUrl && settings.apiUrl.trim()) ? settings.apiUrl : 'https://randomuser.me/api/';
        window.electron?.writeLog?.('INFO', 'Fetching user from API', { ...{ apiUrl }, source: 'CLIENT' });
        const res = await fetch(apiUrl);
        window.electron?.writeLog?.('DEBUG', 'Fetch response', { ...{ status: res.status, statusText: res.statusText }, source: 'CLIENT' });
        if (!res.ok) {
          const text = await res.text();
          window.electron?.writeLog?.('ERROR', 'API Error', { ...{ status: res.status, statusText: res.statusText, text }, source: 'CLIENT' });
          setError(`API Error: ${res.status} ${res.statusText} - ${text}`);
          setUser(null);
          return;
        }
        const data = await res.json();
        window.electron?.writeLog?.('INFO', 'API response data', { ...{ data }, source: 'CLIENT' });
        setUser(data.results[0]);
        setError(null);
      } catch (e: any) {
        window.electron?.writeLog?.('ERROR', 'Fetch error', { ...{ error: e.message || e.toString() }, source: 'CLIENT' });
        setError(`Network/API Error: ${e.message || e.toString()}`);
        setUser(null);
      }
      if (onDataLoaded) onDataLoaded();
    })();
  }, [settings, onDataLoaded, refreshKey]);

  // Log UI-rendered errors
  useEffect(() => {
    if (error) {
      window.electron?.writeLog?.('ERROR', 'UI Rendered Error', { error, source: 'CLIENT' });
    }
  }, [error]);

  return (
    <ErrorBoundary>
      <TopBar onRefresh={() => {
        window.electron?.writeLog?.('INFO', 'Refresh button clicked', { source: 'CLIENT' });
        setRefreshKey(k => k + 1);
      }} />
      <div className="price-screen">
        {error ? (
          <ErrorMessage error={error} />
        ) : (
          user && <UserCard user={user} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PriceScreen; 