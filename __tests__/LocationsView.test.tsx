/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import LocationsView from '@/components/LocationsView';

global.fetch = jest.fn().mockResolvedValue({ json: async () => [] });

// Mock the Map component since it uses Mapbox which requires external dependencies
jest.mock('@/components/Map', () => {
  return function MockedMap() {
    return <div data-testid="map-component">Map Component</div>;
  };
});

// Mock the LocationsSidebar component
jest.mock('@/components/LocationsSidebar', () => {
  return function MockedLocationsSidebar() {
    return <div data-testid="locations-sidebar">Locations Sidebar</div>;
  };
});

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => {
  return () => {
    const MockedComponent = () => <div data-testid="map-component">Map Component</div>;
    MockedComponent.displayName = 'MockedDynamicComponent';
    return MockedComponent;
  };
});

// Render inside act() so the mount fetch's state update settles before assertions.
async function renderSettled() {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(<LocationsView />);
  });
  return result;
}

describe('LocationsView', () => {
  it('renders correctly with proper layout structure', async () => {
    const { container } = await renderSettled();

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'lg:flex-row', 'h-[calc(100vh-4rem)]');
  });

  it('renders map container with correct classes', async () => {
    const { container } = await renderSettled();

    const mapContainer = container.querySelector('.flex-1.h-full');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveClass('flex-1', 'h-full');
  });

  it('renders both Map and LocationsSidebar components', async () => {
    const { getByTestId } = await renderSettled();

    expect(getByTestId('map-component')).toBeInTheDocument();
    expect(getByTestId('locations-sidebar')).toBeInTheDocument();
  });

  it('has responsive layout classes', async () => {
    const { container } = await renderSettled();

    const mainContainer = container.firstChild as HTMLElement;

    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('flex-col'); // Mobile first
    expect(mainContainer).toHaveClass('lg:flex-row'); // Desktop layout
  });

  it('sets correct height for full viewport usage', async () => {
    const { container } = await renderSettled();

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('h-[calc(100vh-4rem)]');
  });
});
