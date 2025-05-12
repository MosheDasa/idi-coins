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
    }
  }
}

const PriceScreen: React.FC<PriceScreenProps> = ({ onDataLoaded }) => {
  const [genderData, setGenderData] = useState<GenderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchGenderData();
    const interval = setInterval(fetchGenderData, 30000);
    return () => clearInterval(interval);
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
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      direction: 'rtl'
    }}>
      <h1>idi-coins</h1>
      <p>נציג: משה כהן</p>
      {isLoading || !genderData ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px'}}>
          <div className="loader" style={{
            width: '60px',
            height: '60px',
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{marginTop: '16px'}}>טוען נתונים...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          <p>מספר התוצאות: {genderData.count}</p>
          <p>שם: {genderData.name}</p>
          <p>מין: {genderData.gender}</p>
          <p>הסתברות: {genderData.probability}</p>
        </>
      )}
    </div>
  );
};

export default PriceScreen; 