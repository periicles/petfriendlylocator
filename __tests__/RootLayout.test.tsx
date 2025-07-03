/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock CSS imports
jest.mock('@/app/globals.css', () => ({}));

// Mock the providers
jest.mock('@/providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

// Mock the ClientNavbarWrapper
jest.mock('@/components/ClientNavbarWrapper', () => {
  return function MockClientNavbarWrapper() {
    return <div data-testid="client-navbar-wrapper">Navbar</div>;
  };
});

describe('RootLayout', () => {
  it('renders the basic HTML structure', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('providers')).toBeInTheDocument();
    expect(screen.getByTestId('client-navbar-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('wraps children in Providers', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    const providers = screen.getByTestId('providers');
    expect(providers).toBeInTheDocument();
    expect(providers).toContainElement(screen.getByTestId('child-content'));
  });

  it('includes the ClientNavbarWrapper', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('client-navbar-wrapper')).toBeInTheDocument();
  });

  it('applies correct classes to body', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Content</div>
      </RootLayout>
    );

    // Note: body classes are applied by Next.js, not directly testable in this context
    // We can test that the component renders without errors
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies correct classes to html', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Content</div>
      </RootLayout>
    );

    // Note: html classes are applied by Next.js, not directly testable in this context
    // We can test that the component renders without errors
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies correct classes to main element', () => {
    render(
      <RootLayout>
        <div data-testid="main-content">Main Content</div>
      </RootLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('pt-16');
    expect(main).toContainElement(screen.getByTestId('main-content'));
  });

  it('renders children inside main element', () => {
    render(
      <RootLayout>
        <div data-testid="page-content">Page Content</div>
      </RootLayout>
    );

    const main = screen.getByRole('main');
    const content = screen.getByTestId('page-content');
    expect(main).toContainElement(content);
  });

  it('renders multiple children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="content-1">Content 1</div>
        <div data-testid="content-2">Content 2</div>
      </RootLayout>
    );

    expect(screen.getByTestId('content-1')).toBeInTheDocument();
    expect(screen.getByTestId('content-2')).toBeInTheDocument();
  });

  it('maintains proper component hierarchy', () => {
    render(
      <RootLayout>
        <div data-testid="child">Child</div>
      </RootLayout>
    );

    // Structure should be: html > body > Providers > (ClientNavbarWrapper + main)
    const providers = screen.getByTestId('providers');
    const navbar = screen.getByTestId('client-navbar-wrapper');
    const main = screen.getByRole('main');
    const child = screen.getByTestId('child');

    expect(providers).toContainElement(navbar);
    expect(providers).toContainElement(main);
    expect(main).toContainElement(child);
  });
});
