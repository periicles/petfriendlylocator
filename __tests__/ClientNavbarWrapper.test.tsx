/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';

// Mock the Navbar component
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Mocked Navbar</nav>;
  };
});

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return function mockDynamic() {
    return function MockComponent() {
      return <nav data-testid="navbar">Mocked Navbar</nav>;
    };
  };
});

describe('ClientNavbarWrapper', () => {
  it('renders the dynamic Navbar component', () => {
    render(<ClientNavbarWrapper />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Mocked Navbar')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<ClientNavbarWrapper />);
    expect(container.firstChild).toBeTruthy();
  });

  it('wraps the Navbar component correctly', () => {
    const { container } = render(<ClientNavbarWrapper />);

    // Should contain the mocked navbar
    const navbar = container.querySelector('[data-testid="navbar"]');
    expect(navbar).toBeInTheDocument();
  });
});
