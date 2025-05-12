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
      getApiUrl: () => string;
    }
  }
}

const PriceScreen: React.FC<PriceScreenProps> = ({ onDataLoaded }) => {
  const [genderData, setGenderData] = useState<GenderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGenderData = async () => {
    try {
      const apiUrl = window.electron.getApiUrl();
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
      setGenderData(data);
      setError(null);
      
      if (onDataLoaded) {
        onDataLoaded();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchGenderData();
    const interval = setInterval(fetchGenderData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      direction: 'rtl'
    }}>
      <h1>idi-coins</h1>
      <p>נציג: משה כהן</p>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : genderData ? (
        <>
          <p>מספר התוצאות: {genderData.count}</p>
          <p>שם: {genderData.name}</p>
          <p>מין: {genderData.gender}</p>
          <p>הסתברות: {genderData.probability}</p>
        </>
      ) : (
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
      )}
    </div>
  );
};

export default PriceScreen; 