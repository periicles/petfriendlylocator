import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboardPage from '@/app/admin/page';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(data: unknown[]) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValueOnce(data),
  });
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    jest.spyOn(window, 'alert').mockReturnValue(undefined);
  });

  it('renders the three tab buttons', async () => {
    mockResponse([]);
    render(<AdminDashboardPage />);
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Lieux')).toBeInTheDocument();
    expect(screen.getByText('Avis')).toBeInTheDocument();
    // Settle the mount fetch's state update inside act().
    await act(async () => {});
  });

  it('fetches the users endpoint on mount', async () => {
    mockResponse([]);
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users');
    });
  });

  it('shows empty state when response is empty', async () => {
    mockResponse([]);
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Aucune donnée à afficher.')).toBeInTheDocument();
    });
  });

  it('renders a table row when data is returned', async () => {
    mockResponse([{ user_id: 'u1', pseudo: 'Alice', email: 'alice@example.com' }]);
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('switches tab and fetches the correct endpoint', async () => {
    mockResponse([]);
    const user = userEvent.setup();
    render(<AdminDashboardPage />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/admin/users'));

    mockResponse([]);
    await user.click(screen.getByText('Lieux'));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/admin/locations'));
  });

  it('does not call delete API when confirm returns false', async () => {
    jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
    mockResponse([{ user_id: 'u1', pseudo: 'Alice', email: 'alice@example.com' }]);

    const user = userEvent.setup();
    render(<AdminDashboardPage />);
    await waitFor(() => screen.getByText('Alice'));

    await user.click(screen.getAllByText('Supprimer')[0]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('calls delete API when confirm returns true', async () => {
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
    mockResponse([{ user_id: 'u1', pseudo: 'Alice', email: 'alice@example.com' }]);
    mockFetch.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    render(<AdminDashboardPage />);
    await waitFor(() => screen.getByText('Alice'));

    await user.click(screen.getAllByText('Supprimer')[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/u1', { method: 'DELETE' });
    });
  });
});
