import React, { useEffect, useState } from 'react';

interface GenderData {
  count: number;
  name: string;
  gender: string;
  probability: number;
}

const PriceScreen: React.FC = () => {
  const [genderData, setGenderData] = useState<GenderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGenderData = async () => {
    try {
      const response = await fetch('https://api.genderize.io/?name=luc');
      const data = await response.json();
      setGenderData(data);
      setError(null);
    } catch (err) {
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
        <p>טוען...</p>
      )}
    </div>
  );
};

export default PriceScreen; 