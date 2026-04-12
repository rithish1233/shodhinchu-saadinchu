import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#e8d5b7',
              border: '1px solid #d4a843',
              fontFamily: "'Noto Serif Telugu', serif",
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#4caf50', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f44336', secondary: '#fff' } }
          }}
        />
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
