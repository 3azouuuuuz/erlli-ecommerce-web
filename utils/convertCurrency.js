// utils/convertCurrency.js

const CACHE_KEY = 'exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const convertCurrency = async (amount, targetCurrency) => {
  try {
    // Return amount as-is if target is USD (no conversion needed)
    if (targetCurrency.toLowerCase() === 'usd') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }

    // Load cached rates from localStorage
    const cachedData = localStorage.getItem(CACHE_KEY);
    let rates = {};
    let isExpired = true;

    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      const now = Date.now();
      if (now - timestamp < CACHE_DURATION) {
        rates = data;
        isExpired = false;
      }
    }

    // Fetch new rates if cache is empty or expired
    if (isExpired) {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      const result = await response.json();
      
      if (!result.rates) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      rates = result.rates;
      
      // Cache rates with timestamp in localStorage
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: rates })
      );
    }

    // Convert amount
    const rate = rates[targetCurrency.toUpperCase()];
    if (!rate) {
      throw new Error(`Currency ${targetCurrency} not supported`);
    }
    
    const convertedAmount = amount * rate;
    
    // Format with Intl.NumberFormat
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency.toUpperCase(),
    }).format(convertedAmount);
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    // Fallback to USD if conversion fails
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};

export default convertCurrency;