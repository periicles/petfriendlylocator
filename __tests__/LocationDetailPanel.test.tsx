/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import LocationDetailPanel from '@/components/LocationDetailPanel';

jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

jest.mock('@mui/icons-material/Close', () => {
  return function MockCloseIcon() {
    return <span data-testid="close-icon">x</span>;
  };
});

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

const location = {
  location_id: 'loc1',
  name: 'Parc Bordelais',
  description: 'Grand parc',
  address: 'Rue du Parc',
  zip_code: 33000,
  city: 'Bordeaux',
  latitude: '44.84',
  longitude: '-0.58',
  created_at: '2024-01-01T00:00:00.000Z',
  location_type: 'PARK',
};

const review = {
  review_id: 'r1',
  rating: 5,
  title: 'Génial',
  content: 'Mon chien adore',
  created_at: '2024-02-01T00:00:00.000Z',
  author: 'Alice',
  location_id: 'loc1',
};

function mockInitialLoad(reviews = [review]) {
  mockFetch
    .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(location) })
    .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(reviews) });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LocationDetailPanel', () => {
  it('renders the location details and existing reviews', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    mockInitialLoad();

    render(<LocationDetailPanel locationId="loc1" onClose={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('Parc Bordelais')).toBeInTheDocument());
    expect(screen.getByText('Génial')).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('hides the form and invites login when unauthenticated', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    mockInitialLoad();

    render(<LocationDetailPanel locationId="loc1" onClose={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('Parc Bordelais')).toBeInTheDocument());
    expect(screen.getByText('Connectez-vous pour laisser un avis.')).toBeInTheDocument();
    expect(screen.queryByText('Publier')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
    mockInitialLoad();
    const onClose = jest.fn();
    const user = userEvent.setup();

    render(<LocationDetailPanel locationId="loc1" onClose={onClose} />);
    await waitFor(() => expect(screen.getByText('Parc Bordelais')).toBeInTheDocument());

    await user.click(screen.getByTitle('Fermer'));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits a new review and prepends it to the list', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.c' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    mockInitialLoad([]);
    const user = userEvent.setup();

    render(<LocationDetailPanel locationId="loc1" onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Parc Bordelais')).toBeInTheDocument());

    const created = { ...review, review_id: 'r2', title: 'Top', content: 'Parfait', author: 'Bob' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(created) });

    await user.type(screen.getByPlaceholderText('Titre'), 'Top');
    await user.type(screen.getByPlaceholderText('Votre avis'), 'Parfait');
    await user.click(screen.getByText('Publier'));

    await waitFor(() => expect(screen.getByText('Top')).toBeInTheDocument());
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/locations/loc1/reviews',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('shows a server error message when the post fails', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.c' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    mockInitialLoad([]);
    const user = userEvent.setup();

    render(<LocationDetailPanel locationId="loc1" onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Parc Bordelais')).toBeInTheDocument());

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ error: 'La note doit être un entier entre 1 et 5.' }),
    });

    await user.type(screen.getByPlaceholderText('Titre'), 'x');
    await user.type(screen.getByPlaceholderText('Votre avis'), 'y');
    await user.click(screen.getByText('Publier'));

    await waitFor(() =>
      expect(screen.getByText('La note doit être un entier entre 1 et 5.')).toBeInTheDocument()
    );
  });
});
