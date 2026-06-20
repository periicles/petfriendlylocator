/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import LocationSidebar from '@/components/LocationsSidebar';

jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

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

jest.mock('@mui/icons-material/Add', () => {
  return function MockAddIcon() {
    return <span data-testid="add-icon">+</span>;
  };
});

const mockLocations = [
  { id: '1', name: 'Park Central', latitude: 44.84, longitude: -0.58 },
  { id: '2', name: 'Beach Resort', latitude: 44.85, longitude: -0.57 },
  { id: '3', name: 'Mountain View', latitude: 44.86, longitude: -0.56 },
];

const mockRefreshLocations = jest.fn();
const mockOnSelect = jest.fn();

describe('LocationSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    expect(screen.getByPlaceholderText('Rechercher un lieu...')).toBeInTheDocument();
  });

  it('renders add button when user is logged in', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });

  it('does not render add button when user is not logged in', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
  });

  it('has correct responsive CSS classes', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });

    const { container } = render(
      <LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />
    );

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

  it('displays locations from props', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    expect(screen.getByText('Park Central')).toBeInTheDocument();
    expect(screen.getByText('Beach Resort')).toBeInTheDocument();
    expect(screen.getByText('Mountain View')).toBeInTheDocument();
  });

  it('filters locations based on search input', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    const user = userEvent.setup();

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'park');

    expect(screen.getByText('Park Central')).toBeInTheDocument();
    expect(screen.queryByText('Beach Resort')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain View')).not.toBeInTheDocument();
  });

  it('search is case insensitive', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    const user = userEvent.setup();

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'BEACH');

    expect(screen.getByText('Beach Resort')).toBeInTheDocument();
    expect(screen.queryByText('Park Central')).not.toBeInTheDocument();
  });

  it('shows all locations when search is cleared', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    const user = userEvent.setup();

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

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

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    const addButton = screen.getByTitle('Ajouter un lieu');
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

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    await user.click(screen.getByTitle('Ajouter un lieu'));
    await user.click(screen.getByTestId('modal-close'));

    expect(screen.queryByTestId('add-location-modal')).not.toBeInTheDocument();
  });

  it('calls refreshLocations and closes modal on success', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    await user.click(screen.getByTitle('Ajouter un lieu'));
    await user.click(screen.getByTestId('modal-success'));

    expect(screen.queryByTestId('add-location-modal')).not.toBeInTheDocument();
    expect(mockRefreshLocations).toHaveBeenCalledTimes(1);
  });

  it('renders location items as clickable buttons with correct styling', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons.forEach((button) => {
      expect(button).toHaveClass('w-full', 'text-left', 'p-2', 'rounded', 'hover:bg-gray-100');
    });
  });

  it('calls onSelect with the location id when a location is clicked', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    const user = userEvent.setup();

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    await user.click(screen.getByText('Beach Resort'));
    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });

  it('handles empty location list', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });

    render(<LocationSidebar locations={[]} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

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

    render(<LocationSidebar locations={mockLocations} refreshLocations={mockRefreshLocations} onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
    await user.type(searchInput, 'park');

    await user.click(screen.getByTitle('Ajouter un lieu'));
    await user.click(screen.getByTestId('modal-close'));

    expect(searchInput).toHaveValue('park');
    expect(screen.getByText('Park Central')).toBeInTheDocument();
    expect(screen.queryByText('Beach Resort')).not.toBeInTheDocument();
  });
});
