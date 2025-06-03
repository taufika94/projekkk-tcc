import './index.css'
import React from 'react';
import { createRoot } from 'react-dom/client'; // Ganti ini
import axios from 'axios';
import App from './App';

axios.defaults.withCredentials = true;

const container = document.getElementById('root');
const root = createRoot(container); // Ganti ini
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
