import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/global.css';
import './styles/responsive.css';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MediaProvider>
        <App />
      </MediaProvider>
    </AuthProvider>
  </StrictMode>
);