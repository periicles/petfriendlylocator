/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import CartePage from '@/app/carte/page';

// Mock the LocationsView component since it contains complex dependencies
jest.mock('@/components/LocationsView', () => {
  return function MockedLocationsView() {
    return <div data-testid="locations-view">Locations View Component</div>;
  };
});

describe('CartePage', () => {
  it('renders correctly', () => {
    render(<CartePage />);

    // Check if the page renders
    expect(screen.getByTestId('locations-view')).toBeInTheDocument();
  });

  it('has correct CSS structure', () => {
    const { container } = render(<CartePage />);

    // Check if the main container has the correct classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex', 'flex-col');
  });

  it('renders LocationsView component', () => {
    render(<CartePage />);

    // Verify that LocationsView is rendered
    expect(screen.getByTestId('locations-view')).toBeInTheDocument();
    expect(screen.getByText('Locations View Component')).toBeInTheDocument();
  });
});
