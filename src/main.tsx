import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker 등록 (프로덕션 환경에서만)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(_registration => {
        // Service worker registered successfully
      })
      .catch(_registrationError => {
        // Service worker registration failed
      });
  });
}
