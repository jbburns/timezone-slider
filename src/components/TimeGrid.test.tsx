import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeGrid from './TimeGrid';
import type { City } from '../lib/CityLink';

const makeCities = (): City[] => [
  { id: 'home-NYC-America/New_York', name: 'New York', country: 'Current Location', timezone: 'America/New_York' },
  { id: 'Tokyo-Japan-Asia/Tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
];

const defaultProps = () => ({
  cities: makeCities(),
  onRemove: vi.fn(),
  onReorder: vi.fn(),
  citySearch: <div data-testid="city-search">Search</div>,
});

describe('TimeGrid', () => {
  it('renders a row for each city', () => {
    const { container } = render(<TimeGrid {...defaultProps()} />);
    const rows = container.querySelectorAll('.location-row');
    expect(rows.length).toBe(2);
  });

  it('renders the city search slot', () => {
    render(<TimeGrid {...defaultProps()} />);
    expect(screen.getByTestId('city-search')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<TimeGrid {...defaultProps()} />);
    expect(screen.getByTitle('-1 Hour')).toBeInTheDocument();
    expect(screen.getByTitle('+1 Hour')).toBeInTheDocument();
    expect(screen.getByTitle('-1 Day')).toBeInTheDocument();
    expect(screen.getByTitle('+1 Day')).toBeInTheDocument();
  });

  it('renders the Now button', () => {
    render(<TimeGrid {...defaultProps()} />);
    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('renders a date picker', () => {
    const { container } = render(<TimeGrid {...defaultProps()} />);
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('Now button is disabled by default (already at now)', () => {
    render(<TimeGrid {...defaultProps()} />);
    const nowBtn = screen.getByTitle('Reset to current time');
    expect(nowBtn).toBeDisabled();
  });

  it('Now button becomes enabled after navigating', async () => {
    const user = userEvent.setup();
    render(<TimeGrid {...defaultProps()} />);

    await user.click(screen.getByTitle('+1 Hour'));
    const nowBtn = screen.getByTitle('Reset to current time');
    expect(nowBtn).not.toBeDisabled();
  });

  it('shows empty message when no cities', () => {
    render(<TimeGrid {...defaultProps()} cities={[]} onRemove={vi.fn()} onReorder={vi.fn()} />);
    expect(screen.getByText('Add a city to start')).toBeInTheDocument();
  });

  it('renders with a single city', () => {
    const cities = [makeCities()[0]];
    const { container } = render(<TimeGrid {...defaultProps()} cities={cities} />);
    const rows = container.querySelectorAll('.location-row');
    expect(rows.length).toBe(1);
  });
});
