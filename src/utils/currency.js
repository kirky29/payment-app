// Currency formatting utility that uses app settings
export const formatCurrency = (amount, currency = 'USD') => {
  // Safety checks for amount
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  
  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  
  // Final safety check
  if (isNaN(numericAmount)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(0);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(numericAmount);
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