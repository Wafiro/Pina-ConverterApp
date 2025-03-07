// src/components/CurrencyConverter.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CurrencyConverter.css';
//Limited Live ExchangeRates
import { getExchangeRates } from '../services/exchangeRateService';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Store the last successfully converted values to keep them fixed in the result
  const [lastConvertedValues, setLastConvertedValues] = useState({
    inputAmount: '',
    fromCurrency: '',
    toCurrency: '',
    result: '',
    rate: ''
  });

  // Have only these three available
  const availableCurrencies = ['EUR', 'USD', 'JPY'];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // If takes longer to load, a screen should be there
        setLoading(true);
        // TODO: Change API to real live one without credits
        //const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
        const response = await getExchangeRates(fromCurrency);
        setRates(response);
        setError('');
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setError('Failed to fetch exchange rates. Please try again later.');
      } finally {
        // Deactivate loading screen when done
        setLoading(false);
      }
    };

    fetchRates();
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (e) => {

    // Allow only numbers and decimal point
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleConvert = (e) => {
    e?.preventDefault();
    
    // Validation 1: Negative or NaN
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    
    // Validation 2: Currencies are not on the api/problem by calling the rate
    if (loading || !rates[fromCurrency] || !rates[toCurrency]) {
      setError('Exchange rates not available yet');
      return;
    }

    setError('');
    const rate = rates[toCurrency] / rates[fromCurrency];
    const result = (parseFloat(amount) * rate).toFixed(4);
    setConvertedAmount({
      value: result,
      from: fromCurrency,
      to: toCurrency,
      rate: rate.toFixed(4)
    });

    // Store the values that were used for this conversion
    setLastConvertedValues({
      inputAmount: amount,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      result: result,
      rate: rate.toFixed(4)
    });

  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    handleConvert();
  };

  return (
    <div className='converter-wrapper'>
    <div className="converter-container">
      <h1>Currency Converter</h1>
      
      {loading ? (
        <div className="loading">Loading exchange rates...</div>
      ) : (
        <form onSubmit={handleConvert} data-testid="converter-form">
          <div className="input-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={handleAmountChange}
              data-testid="amount-input"
              aria-label="Amount to convert"
            />
          </div>
          
          <div className="currency-selectors">
            <div className="select-group">
              <label htmlFor="from-currency">From</label>
              <select
                id="from-currency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                data-testid="from-currency-select"
                aria-label="From currency"
              >
                {availableCurrencies.map((currency) => (
                  <option key={`from-${currency}`} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="button" 
              className="swap-button" 
              onClick={handleSwapCurrencies}
              aria-label="Swap currencies"
            >
              ⇄
            </button>
            
            <div className="select-group">
              <label htmlFor="to-currency">To</label>
              <select
                id="to-currency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                data-testid="to-currency-select"
                aria-label="To currency"
              >
                {availableCurrencies.map((currency) => (
                  <option key={`to-${currency}`} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
          
          {error && <div className="error-message" data-testid="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="convert-button"
            data-testid="convert-button"
          >
            Convert
          </button>
        </form>
      )}
      
      {lastConvertedValues.result && (
          <div className="result" data-testid="conversion-result">
            <p>
              {lastConvertedValues.inputAmount} {lastConvertedValues.fromCurrency} = 
              <span className="converted-amount"> {lastConvertedValues.result} {lastConvertedValues.toCurrency}</span>
            </p>
            <p className="rate-info">
              1 {lastConvertedValues.fromCurrency} = {lastConvertedValues.rate} {lastConvertedValues.toCurrency}
            </p>
          </div>
      )}
    </div>
    </div>
  );
};

export default CurrencyConverter;