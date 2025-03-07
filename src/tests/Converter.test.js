// src/components/CurrencyConverter.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import CurrencyConverter from './CurrencyConverter';

// Mock axios
jest.mock('axios');

describe('CurrencyConverter Component', () => {
  beforeEach(() => {
    // Mock API response
    axios.get.mockResolvedValue({
      data: {
        base: 'EUR',
        rates: {
          EUR: 1,
          USD: 1.1,
          JPY: 160
        }
      }
    });
  });

  test('renders the component with initial state', async () => {
    render(<CurrencyConverter />);
    
    // Check if title is rendered
    expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading exchange rates...')).not.toBeInTheDocument();
    });
    
    // Check for default currency options
    expect(screen.getByTestId('from-currency-select')).toHaveValue('EUR');
    expect(screen.getByTestId('to-currency-select')).toHaveValue('USD');
  });

  test('validates the amount input', async () => {
    render(<CurrencyConverter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading exchange rates...')).not.toBeInTheDocument();
    });
    
    const amountInput = screen.getByTestId('amount-input');
    const convertButton = screen.getByTestId('convert-button');
    
    // Empty input
    fireEvent.click(convertButton);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid positive amount');
    
    // Invalid input
    fireEvent.change(amountInput, { target: { value: '-10' } });
    fireEvent.click(convertButton);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid positive amount');
    
    // Valid input
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(convertButton);
    
    // Check if conversion is displayed
    await waitFor(() => {
      expect(screen.getByTestId('conversion-result')).toBeInTheDocument();
      expect(screen.getByText(/100 EUR =/)).toBeInTheDocument();
      expect(screen.getByText(/110.00 USD/)).toBeInTheDocument();
    });
  });

  test('swaps currencies when swap button is clicked', async () => {
    render(<CurrencyConverter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading exchange rates...')).not.toBeInTheDocument();
    });
    
    const fromCurrencySelect = screen.getByTestId('from-currency-select');
    const toCurrencySelect = screen.getByTestId('to-currency-select');
    const swapButton = screen.getByRole('button', { name: /swap currencies/i });
    
    // Initial values
    expect(fromCurrencySelect).toHaveValue('EUR');
    expect(toCurrencySelect).toHaveValue('USD');
    
    // Click swap button
    fireEvent.click(swapButton);
    
    // Values should be swapped
    expect(fromCurrencySelect).toHaveValue('USD');
    expect(toCurrencySelect).toHaveValue('EUR');
  });
});