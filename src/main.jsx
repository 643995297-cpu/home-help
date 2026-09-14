import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HouseProvider } from './store/HouseContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HouseProvider>
        <App />
      </HouseProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
