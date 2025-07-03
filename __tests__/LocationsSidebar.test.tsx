/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import LocationSidebar from '@/components/LocationsSidebar';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock AddLocationModal
jest.mock('@/components/AddLocationModal', () => {
  return function MockAddLocationModal({
    onClose,
    onSuccess,
  }: {
    onClose: () => void;
    onSuccess: () => void;
  }) {
    return (
      <div data-testid="add-location-modal">
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        <button onClick={onSuccess} data-testid="modal-success">
          Success
        </button>
      </div>
    );
  };
});

// Mock Material-UI AddIcon
jest.mock('@mui/icons-material/Add', () => {
  return function MockAddIcon() {
    return <span data-testid="add-icon">+</span>;
  };
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockLocations = [
  { location_id: '1', name: 'Park Central' },
  { location_id: '2', name: 'Beach Resort' },
  { location_id: '3', name: 'Mountain View' },
];

describe('LocationSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockLocations,
    });
  });

  it('renders search input', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar />);

    expect(screen.getByPlaceholderText('Rechercher un lieu...')).toBeInTheDocument();
  });

  it('renders add button when user is logged in', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar />);

    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });

  it('does not render add button when user is not logged in', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar />);

    expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
  });

  it('has correct responsive CSS classes', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    const { container } = render(<LocationSidebar />);

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass(
      'w-full',
      'lg:w-[400px]',
      'border-t',
      'lg:border-t-0',
      'lg:border-l',
      'border-gray-200',
      'p-4'
    );
  });

  it('fetches locations on component mount', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/locations');
    });
  });

  it('displays fetched locations', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Park Central')).toBeInTheDocument();
      expect(screen.getByText('Beach Resort')).toBeInTheDocument();
      expect(screen.getByText('Mountain View')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erreur chargement des lieux:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('filters locations based on search input', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Park Central')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'park');

    expect(screen.getByText('Park Central')).toBeInTheDocument();
    expect(screen.queryByText('Beach Resort')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain View')).not.toBeInTheDocument();
  });

  it('search is case insensitive', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Park Central')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'BEACH');

    expect(screen.getByText('Beach Resort')).toBeInTheDocument();
    expect(screen.queryByText('Park Central')).not.toBeInTheDocument();
  });

  it('shows all locations when search is cleared', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Park Central')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'park');
    await user.clear(searchInput);

    expect(screen.getByText('Park Central')).toBeInTheDocument();
    expect(screen.getByText('Beach Resort')).toBeInTheDocument();
    expect(screen.getByText('Mountain View')).toBeInTheDocument();
  });

  it('opens modal when add button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    const addButton = screen.getByRole('button');
    await user.click(addButton);

    expect(screen.getByTestId('add-location-modal')).toBeInTheDocument();
  });

  it('closes modal when onClose is called', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    const addButton = screen.getByRole('button');
    await user.click(addButton);

    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    expect(screen.queryByTestId('add-location-modal')).not.toBeInTheDocument();
  });

  it('refetches locations and closes modal on success', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/locations');
    });

    const addButton = screen.getByRole('button');
    await user.click(addButton);

    const successButton = screen.getByTestId('modal-success');
    await user.click(successButton);

    expect(screen.queryByTestId('add-location-modal')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('renders location items with correct styling', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Park Central')).toBeInTheDocument();
    });

    const locationItems = screen.getAllByRole('listitem');
    expect(locationItems).toHaveLength(3);

    locationItems.forEach((item) => {
      expect(item).toHaveClass('p-2', 'rounded', 'hover:bg-gray-100', 'cursor-pointer');
    });
  });

  it('handles empty location list', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<LocationSidebar />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toBeEmptyDOMElement();
  });

  it('maintains search state while modal operations', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Park Central')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'park');

    const addButton = screen.getByRole('button');
    await user.click(addButton);
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    expect(searchInput).toHaveValue('park');
    expect(screen.getByText('Park Central')).toBeInTheDocument();
    expect(screen.queryByText('Beach Resort')).not.toBeInTheDocument();
  });
});
