import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import LocationRow from './LocationRow';
import type { City } from '../lib/CityLink';

const makeCity = (overrides?: Partial<City>): City => ({
  id: 'test-city-tz',
  name: 'Test City',
  country: 'Test Country',
  timezone: 'America/New_York',
  ...overrides,
});

const defaultProps = () => ({
  city: makeCity(),
  isHome: false,
  homeStartHour: DateTime.now().setZone('America/New_York').startOf('hour'),
  onRemove: vi.fn(),
  hoveredIndex: null,
  onHoverIndex: vi.fn(),
  pinnedColumnIndex: null,
  onCellClick: vi.fn(),
  draggable: true,
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onDragEnd: vi.fn(),
  isDragging: false,
  showDropIndicator: false,
  isExactTime: true,
});

describe('LocationRow', () => {
  it('renders the city name', () => {
    render(<LocationRow {...defaultProps()} />);
    expect(screen.getByText('Test City')).toBeInTheDocument();
  });

  it('renders 24 time cells', () => {
    const { container } = render(<LocationRow {...defaultProps()} />);
    const cells = container.querySelectorAll('.time-cell');
    expect(cells.length).toBe(24);
  });

  it('shows remove button for non-home cities', () => {
    render(<LocationRow {...defaultProps()} />);
    expect(screen.getByTitle('Remove city')).toBeInTheDocument();
  });

  it('does not show remove button for home city', () => {
    render(<LocationRow {...defaultProps()} isHome={true} />);
    expect(screen.queryByTitle('Remove city')).not.toBeInTheDocument();
  });

  it('shows home icon for home city', () => {
    const { container } = render(<LocationRow {...defaultProps()} isHome={true} />);
    expect(container.querySelector('.home-icon')).toBeInTheDocument();
  });

  it('applies dragging class when isDragging is true', () => {
    const { container } = render(<LocationRow {...defaultProps()} isDragging={true} />);
    expect(container.querySelector('.dragging')).toBeInTheDocument();
  });

  it('applies drop-target class when showDropIndicator is true', () => {
    const { container } = render(<LocationRow {...defaultProps()} showDropIndicator={true} />);
    expect(container.querySelector('.drop-target')).toBeInTheDocument();
  });

  it('marks business hour cells correctly', () => {
    const { container } = render(<LocationRow {...defaultProps()} />);
    const businessCells = container.querySelectorAll('.business-hour');
    const offHourCells = container.querySelectorAll('.off-hour');
    // There should be some of each in a 24-hour period
    expect(businessCells.length).toBeGreaterThan(0);
    expect(offHourCells.length).toBeGreaterThan(0);
    // Business hours: 9-17 inclusive = 9 hours, off hours = 15
    expect(businessCells.length).toBe(9);
    expect(offHourCells.length).toBe(15);
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<LocationRow {...defaultProps()} onRemove={onRemove} />);
    screen.getByTitle('Remove city').click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('displays timezone abbreviation', () => {
    const { container } = render(<LocationRow {...defaultProps()} />);
    const abbrev = container.querySelector('.city-abbrev');
    expect(abbrev).toBeInTheDocument();
    expect(abbrev!.textContent).toBeTruthy();
  });

  it('displays time in HH:mm format', () => {
    const { container } = render(<LocationRow {...defaultProps()} />);
    const timeDisplay = container.querySelector('.city-time-display');
    expect(timeDisplay).toBeInTheDocument();
    // Should match HH:mm pattern
    expect(timeDisplay!.textContent).toMatch(/\d{2}:\d{2}/);
  });
});
