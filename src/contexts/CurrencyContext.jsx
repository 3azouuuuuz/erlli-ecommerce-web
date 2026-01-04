import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const CACHE_KEY = 'exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('usd');
  const [rates, setRates] = useState({});

  // Load saved currency and cached rates on mount
  useEffect(() => {
    const loadCurrencyAndRates = () => {
      try {
        const storedCurrency = localStorage.getItem('selectedCurrency');
        if (storedCurrency) {
          setCurrency(storedCurrency.toLowerCase());
        }

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          const now = Date.now();
          if (now - timestamp < CACHE_DURATION) {
            setRates(data);
          }
        }
      } catch (error) {
        console.error('Failed to load currency or rates:', error.message);
      }
    };

    loadCurrencyAndRates();
  }, []);

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      const result = await response.json();

      if (!result.rates) {
        throw new Error('Failed to fetch exchange rates');
      }

      const newRates = result.rates;
      setRates(newRates);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: newRates })
      );

      return newRates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      return rates;
    }
  };

  // Convert amount and return just the number
  const convertAmount = async (amount) => {
    try {
      const targetCurrency = currency.toLowerCase();

      // If USD, return the amount as-is
      if (targetCurrency === 'usd') {
        return amount;
      }

      // Get rates if not loaded
      let currentRates = rates;
      if (Object.keys(rates).length === 0) {
        currentRates = await fetchExchangeRates();
      }

      const rate = currentRates[targetCurrency.toUpperCase()];
      if (!rate) {
        throw new Error(`Currency ${targetCurrency} not supported`);
      }

      return amount * rate;
    } catch (error) {
      console.error('Currency conversion error:', error.message);
      return amount;
    }
  };

  // Convert amount and return formatted string
  const formatCurrency = async (amount) => {
    try {
      const targetCurrency = currency.toLowerCase();

      // If USD, format and return
      if (targetCurrency === 'usd') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }

      // Get rates if not loaded
      let currentRates = rates;
      if (Object.keys(rates).length === 0) {
        currentRates = await fetchExchangeRates();
      }

      const rate = currentRates[targetCurrency.toUpperCase()];
      if (!rate) {
        throw new Error(`Currency ${targetCurrency} not supported`);
      }

      const convertedAmount = amount * rate;

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: targetCurrency.toUpperCase(),
      }).format(convertedAmount);
    } catch (error) {
      console.error('Currency formatting error:', error.message);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
  };

  // Change the current currency
  const changeCurrency = async (newCurrency) => {
    try {
      newCurrency = newCurrency.toLowerCase();
      setCurrency(newCurrency);
      localStorage.setItem('selectedCurrency', newCurrency);
    } catch (error) {
      console.error('Failed to save currency:', error.message);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        changeCurrency, 
        convertAmount, 
        formatCurrency 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};