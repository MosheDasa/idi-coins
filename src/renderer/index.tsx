import React from 'react';
import { createRoot } from 'react-dom/client';
import PriceScreen from './PriceScreen/PriceScreen';

function hideLoaderAndShowApp() {
  const loader = document.getElementById('global-loader');
  const appRoot = document.getElementById('root');
  if (loader && appRoot) {
    loader.style.display = 'none';
    appRoot.style.display = '';
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PriceScreen onDataLoaded={hideLoaderAndShowApp} />);
} 