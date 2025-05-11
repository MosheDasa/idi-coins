import React from 'react';
import { createRoot } from 'react-dom/client';
import PriceScreen from './PriceScreen';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PriceScreen />);
} 