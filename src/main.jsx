import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with immediate auto-update for PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New Insaan version available. Refreshing...');
  },
  onOfflineReady() {
    console.log('Insaan is ready for complete offline operation.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

