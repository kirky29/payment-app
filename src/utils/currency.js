// Currency formatting utility that uses app settings
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Get currency symbol from currency code
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'JPY': '¥',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
  };
  return symbols[currencyCode] || '$';
}; 