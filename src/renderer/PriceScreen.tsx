import React, { useEffect, useState } from 'react';

interface PriceScreenProps {
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

const PriceScreen: React.FC<PriceScreenProps> = ({ onDataLoaded }) => {
  const [settings, setSettings] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load settings once on mount
  useEffect(() => {
    (async () => {
      if (window.electron?.getSettings) {
        const s = await window.electron.getSettings();
        console.log('[IDI-COINS] Loaded settings:', s);
        setSettings(s);
      } else {
        console.warn('[IDI-COINS] window.electron?.getSettings is not available');
      }
    })();
  }, []);

  // Fetch user only after settings are loaded
  useEffect(() => {
    if (!settings) {
      console.warn('[IDI-COINS] Settings not loaded yet, skipping API fetch');
      return;
    }
    (async () => {
      try {
        const apiUrl = (settings.apiUrl && settings.apiUrl.trim()) ? settings.apiUrl : 'https://randomuser.me/api/';
        console.log('[IDI-COINS] Fetching user from API:', apiUrl);
        const res = await fetch(apiUrl);
        console.log('[IDI-COINS] Fetch response:', res);
        if (!res.ok) {
          const text = await res.text();
          setError(`API Error: ${res.status} ${res.statusText} - ${text}`);
          setUser(null);
          return;
        }
        const data = await res.json();
        console.log('[IDI-COINS] API response data:', data);
        setUser(data.results[0]);
        setError(null);
      } catch (e: any) {
        console.error('[IDI-COINS] Fetch error:', e);
        setError(`Network/API Error: ${e.message || e.toString()}`);
        setUser(null);
      }
      if (onDataLoaded) onDataLoaded();
    })();
  }, [settings, onDataLoaded]);

  return (
    <>
      <style>{`
        html, body {
          height: 100vh !important;
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          minHeight: '100vh',
          height: '100vh',
          width: '100vw',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Heebo, Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {error ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
              padding: '32px 32px 24px 32px',
              minWidth: 320,
              maxWidth: 340,
              textAlign: 'center',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            שגיאה בטעינת נתוני נציג:<br />
            <span style={{ fontWeight: 400, fontSize: 14, color: '#b91c1c' }}>{error}</span>
          </div>
        ) : (
          user && (
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
                padding: '32px 32px 24px 32px',
                minWidth: 320,
                maxWidth: 340,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 18, color: '#2563eb', fontWeight: 600, marginBottom: 8 }}>
                שם נציג: {user ? `${user.name.first} ${user.name.last}` : 'not found - error 111'}
              </div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                לידיעתך סכום הצבירה בקופה שלך נכון לתאריך: {new Date().toLocaleDateString('he-IL')}
              </div>
              <div style={{ margin: '0 auto 16px auto', width: 64, height: 64 }}>
                <CoinIcon />
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#059669', letterSpacing: 1, marginBottom: 0 }}>
                {user ? user.location.street.number.toLocaleString('he-IL') : '5,000'} <span style={{ fontSize: 22, fontWeight: 500, color: '#2563eb' }}>₪</span>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default PriceScreen; 