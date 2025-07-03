/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Providers } from '@/providers';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe('Providers', () => {
  it('renders children wrapped in SessionProvider', () => {
    render(
      <Providers>
        <div data-testid="test-child">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Providers>
        <div>Content</div>
      </Providers>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('properly wraps multiple children', () => {
    render(
      <Providers>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
      </Providers>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    const { container } = render(<Providers>{null}</Providers>);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });
});
