import axios from 'axios';

const API_URL = 'https://api.exchangeratesapi.io/v1/latest';
const API_KEY = 'c6b5533829c237e2190d3ca69f870668';

export const getExchangeRates = async (baseCurrency = 'EUR') => {
    try {
        const response = await axios.get(`${API_URL}?access_key=${API_KEY}&base=${baseCurrency}`);
        return response.data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
};

export const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
    if (!rates[toCurrency]) {
        throw new Error('Invalid target currency');
    }

    const rate = rates[toCurrency];
    return (amount * rate).toFixed(2);
};
