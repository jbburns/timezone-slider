import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CitySearch from './CitySearch';

describe('CitySearch', () => {
  it('renders the search input', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('Add City ...')).toBeInTheDocument();
  });

  it('does not show results initially', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows results when typing a valid city name', async () => {
    const user = userEvent.setup();
    render(<CitySearch onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'Tokyo');

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('does not show results for single character', async () => {
    const user = userEvent.setup();
    render(<CitySearch onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'T');

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('calls onSelect when clicking a result', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CitySearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'Tokyo');
    await user.click(screen.getByText('Tokyo'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Tokyo', timezone: 'Asia/Tokyo' })
    );
  });

  it('clears input after selecting a city', async () => {
    const user = userEvent.setup();
    render(<CitySearch onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add City ...') as HTMLInputElement;
    await user.type(input, 'Tokyo');
    await user.click(screen.getByText('Tokyo'));

    expect(input.value).toBe('');
  });

  it('selects city with Enter key', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CitySearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'Tokyo');
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('closes dropdown with Escape', async () => {
    const user = userEvent.setup();
    render(<CitySearch onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'Tokyo');
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('navigates results with arrow keys', async () => {
    const user = userEvent.setup();
    render(<CitySearch onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add City ...');
    await user.type(input, 'London');

    // First result should be selected by default
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('selected');

    // Press down arrow
    await user.keyboard('{ArrowDown}');
    // Selection should have moved (if there are multiple results)
    if (items.length > 1) {
      expect(items[1]).toHaveClass('selected');
    }
  });
});
