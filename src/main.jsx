import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CurrencyProvider } from './contexts/CurrencyContext.jsx';
import App from './App.jsx';
import '../utils/i18n'; // ADD THIS LINE - Import i18n configuration
import './index.css';

const stripePromise = loadStripe('pk_test_51R3ey2Rtj5EiZCcl1cNM6tOogflWm9S5HRrXhmABFrZ1HduXjb6R38vhTEUwsUXJCRG5zhjSGU54OYoYfu5PnfJj00nCEYBGdr');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrencyProvider>
      <BrowserRouter>
        <AuthProvider>
          <Elements stripe={stripePromise}>
            <App />
          </Elements>
        </AuthProvider>
      </BrowserRouter>
    </CurrencyProvider>
  </React.StrictMode>
);