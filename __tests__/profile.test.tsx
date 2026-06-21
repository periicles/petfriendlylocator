/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfile from '@/app/profile/page';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUserData = {
  pseudo: 'johndoe',
  email: 'john.doe@example.com',
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUserData,
    });
  });

  it('shows loading state initially', async () => {
    render(<UserProfile />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    // Settle the mount fetch's state update inside act().
    await act(async () => {});
  });

  it('displays user data after loading', async () => {
    render(<UserProfile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    });
  });

  it('fetches user data from /api/user/me', async () => {
    render(<UserProfile />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/me');
    });
  });

  it('shows error message when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    render(<UserProfile />);
    await waitFor(() => {
      expect(
        screen.getByText('Erreur lors du chargement des données utilisateur')
      ).toBeInTheDocument();
    });
  });

  it('shows profile heading', async () => {
    render(<UserProfile />);
    await waitFor(() => {
      expect(screen.getByText('Votre profil')).toBeInTheDocument();
    });
  });

  it('submits updated profile successfully', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserData })
      .mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));

    await waitFor(() => {
      expect(screen.getByText('Profil mis à jour avec succès !')).toBeInTheDocument();
    });
  });

  it('shows error message when update fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserData })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'update failed' }) });

    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));

    await waitFor(() => {
      expect(screen.getByText('Erreur : update failed')).toBeInTheDocument();
    });
  });

  it('calls /api/user/update with correct payload on submit', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserData })
      .mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo: 'johndoe', email: 'john.doe@example.com' }),
      });
    });
  });
});
