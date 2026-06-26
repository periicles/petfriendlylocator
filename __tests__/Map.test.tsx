/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import * as React from 'react';
import mapboxgl from 'mapbox-gl';
import Map from '@/components/Map';
import { ACTIVE_MAP_STYLE } from '@/components/mapStyles';

// Mock mapbox-gl
jest.mock('mapbox-gl', () => ({
  accessToken: '',
  Map: jest.fn().mockImplementation(() => ({
    remove: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    loaded: jest.fn().mockReturnValue(false),
  })),
}));

// Mock the CSS import
jest.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

const mockMapboxgl = mapboxgl as jest.Mocked<typeof mapboxgl>;

describe('Map Component', () => {
  beforeEach(() => {
    // Mock the environment variable
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders map container with correct classes', () => {
    const { container } = render(<Map locations={[]} />);

    const mapContainer = container.firstChild as HTMLElement;
    expect(mapContainer).toHaveClass('w-full', 'h-full', 'min-h-[500px]');
  });

  it('sets mapbox access token from environment variable', () => {
    expect(process.env.NEXT_PUBLIC_MAPBOX_TOKEN).toBe('test-token');
  });

  it('initializes mapbox map with correct configuration', () => {
    const { container } = render(<Map locations={[]} />);

    expect(mockMapboxgl.Map).toHaveBeenCalledWith({
      container: container.firstChild,
      style: ACTIVE_MAP_STYLE,
      center: [-0.57918, 44.837789],
      zoom: 12,
    });
  });

  it('cleans up map on unmount', () => {
    const mockRemove = jest.fn();
    (mockMapboxgl.Map as jest.Mock).mockImplementation(() => ({
      remove: mockRemove,
      on: jest.fn(),
      off: jest.fn(),
      loaded: jest.fn().mockReturnValue(false),
    }));

    const { unmount } = render(<Map locations={[]} />);
    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('does not initialize map twice', () => {
    const { rerender } = render(<Map locations={[]} />);

    (mockMapboxgl.Map as jest.Mock).mockClear();

    rerender(<Map locations={[]} />);

    expect(mockMapboxgl.Map).not.toHaveBeenCalled();
  });

  it('handles missing container gracefully', () => {
    const { container } = render(<Map locations={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
