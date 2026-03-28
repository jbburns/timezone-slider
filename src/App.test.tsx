import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(document.querySelector('.app-container')).toBeInTheDocument();
  });

  it('shows at least one city row (home city) on first load', () => {
    render(<App />);
    const rows = document.querySelectorAll('.location-row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('persists cities to localStorage', () => {
    render(<App />);
    const stored = localStorage.getItem('timezone-slider-cities');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(1);
  });

  it('restores cities from localStorage', () => {
    const cities = [
      { id: 'test-1', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
      { id: 'test-2', name: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
    ];
    localStorage.setItem('timezone-slider-cities', JSON.stringify(cities));

    render(<App />);
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('falls back to home city if localStorage is corrupted', () => {
    localStorage.setItem('timezone-slider-cities', 'not valid json!!!');
    render(<App />);
    // Should still render with at least the home city
    const rows = document.querySelectorAll('.location-row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('adds a city via search', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'London');

    // Click the result in the dropdown (use the city-name class to target the dropdown item)
    const dropdownItem = document.querySelector('.search-results .city-name');
    expect(dropdownItem).toBeInTheDocument();
    await user.click(dropdownItem!);

    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('does not add duplicate timezone', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('Add City ...');
    const rowsBefore = document.querySelectorAll('.location-row').length;

    // Add London
    await user.type(input, 'London');
    const dropdownItem = document.querySelector('.search-results .city-name');
    await user.click(dropdownItem!);

    const rowsAfterFirst = document.querySelectorAll('.location-row').length;
    expect(rowsAfterFirst).toBe(rowsBefore + 1);

    // Try adding London again
    await user.type(input, 'London');
    const dropdownItem2 = document.querySelector('.search-results .city-name');
    await user.click(dropdownItem2!);

    const rowsAfterSecond = document.querySelectorAll('.location-row').length;
    expect(rowsAfterSecond).toBe(rowsAfterFirst);
  });

  it('removes a city when remove button is clicked', async () => {
    const cities = [
      { id: 'home-NYC', name: 'New York', country: 'Current Location', timezone: 'America/New_York' },
      { id: 'test-tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
    ];
    localStorage.setItem('timezone-slider-cities', JSON.stringify(cities));

    render(<App />);
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    // Click the remove button (there should be one for Tokyo, not for home)
    const removeButtons = screen.getAllByTitle('Remove city');
    expect(removeButtons.length).toBe(1);
    await userEvent.click(removeButtons[0]);

    expect(screen.queryByText('Tokyo')).not.toBeInTheDocument();
  });
});
