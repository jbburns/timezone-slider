import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders the title', () => {
    render(<Header />);
    expect(screen.getByText('Timezone Slider')).toBeInTheDocument();
  });

  it('renders as a header element', () => {
    render(<Header />);
    expect(document.querySelector('header')).toBeInTheDocument();
  });
});
