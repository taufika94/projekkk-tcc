import './index.css'
import React from 'react';
import { createRoot } from 'react-dom/client'; // Ganti ini

import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // Ganti ini
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
