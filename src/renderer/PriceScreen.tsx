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

  useEffect(() => {
    (async () => {
      if (window.electron?.getSettings) {
        const s = await window.electron.getSettings();
        setSettings(s);
      }
      if (onDataLoaded) onDataLoaded();
    })();
  }, [onDataLoaded]);

  const repName = settings?.representativeName || settings?.userId || '---';
  const today = new Date();
  const dateStr = today.toLocaleDateString('he-IL');
  const sum = settings?.sum || '5,000';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Heebo, Arial, sans-serif',
      }}
    >
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
          שם נציג: {repName}
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
          לידיעתך סכום הצבירה בקופה שלך נכון לתאריך: {dateStr}
        </div>
        <div style={{ margin: '0 auto 16px auto', width: 64, height: 64 }}>
          <CoinIcon />
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#059669', letterSpacing: 1, marginBottom: 0 }}>
          {sum} <span style={{ fontSize: 22, fontWeight: 500, color: '#2563eb' }}>₪</span>
        </div>
      </div>
    </div>
  );
};

export default PriceScreen; 