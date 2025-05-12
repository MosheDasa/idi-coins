import React, { useEffect, useState } from 'react';

interface GenderData {
  count: number;
  name: string;
  gender: string;
  probability: number;
}

interface PriceScreenProps {
  onDataLoaded?: () => void;
}

// We'll get this from the window object
declare global {
  interface Window {
    electron: {
      getApiUrl: () => Promise<string>;
      getSettings: () => Promise<any>;
      minimize: () => void;
      close: () => void;
    }
  }
}

const PriceScreen: React.FC<PriceScreenProps> = ({ onDataLoaded }) => {
  const [genderData, setGenderData] = useState<GenderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const settingsData = await window.electron.getSettings();
      setSettings(settingsData);
      return settingsData;
    } catch (err) {
      console.error('Error fetching settings:', err);
      return null;
    }
  };

  const fetchGenderData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = await window.electron.getApiUrl();
      console.log('API URL:', apiUrl);

      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${apiUrl}/?name=luc`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);

      setGenderData(data);
      setError(null);
      
      if (onDataLoaded) {
        onDataLoaded();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    const initialize = async () => {
      const settingsData = await fetchSettings();
      await fetchGenderData();
      
      // Set up polling interval based on settings
      const interval = setInterval(fetchGenderData, (settingsData?.pollingInterval || 30) * 1000);
      return () => clearInterval(interval);
    };
    
    initialize();
  }, []);

  if (error) {
    return (
      <div style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        direction: 'rtl'
      }}>
        <h1>idi-coins</h1>
        <p>נציג: משה כהן</p>
        <p style={{ color: 'red' }}>שגיאה: {error}</p>
        <button onClick={fetchGenderData} style={{
          padding: '10px 20px',
          marginTop: '10px',
          cursor: 'pointer'
        }}>
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Custom title bar */}
      <div style={{
        WebkitUserSelect: 'none',
        height: '32px',
        backgroundColor: '#2196F3',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0'
      }} className="draggable">
        <div style={{
          display: 'flex',
          height: '100%'
        }} className="non-draggable">
          <button onClick={() => window.electron.minimize()} style={{
            border: 'none',
            background: 'none',
            width: '46px',
            height: '100%',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }} className="window-control">
            &#x2014;
          </button>
          <button onClick={() => window.electron.close()} style={{
            border: 'none',
            background: 'none',
            width: '46px',
            height: '100%',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }} className="window-control close-button">
            &#x2715;
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        direction: 'rtl',
        height: 'calc(100vh - 32px)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <style>{`
          body {
            margin: 0;
            overflow: hidden;
          }
          
          .draggable {
            -webkit-app-region: drag;
          }
          
          .non-draggable {
            -webkit-app-region: no-drag;
          }
          
          .window-control:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .close-button:hover {
            background-color: #e81123 !important;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <p>נציג: {settings?.representativeName || 'לא מוגדר'}</p>
        {isLoading || !genderData ? (
          <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 'calc(100% - 60px)'
          }}>
            <div className="loader" style={{
              width: '60px',
              height: '60px',
              border: '8px solid #f3f3f3',
              borderTop: '8px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{marginTop: '16px'}}>טוען נתונים...</span>
          </div>
        ) : (
          <div style={{
            height: 'calc(100% - 60px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <p>מספר התוצאות: {genderData.count}</p>
            <p>שם: {genderData.name}</p>
            <p>מין: {genderData.gender}</p>
            <p>הסתברות: {genderData.probability}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PriceScreen; 