/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddLocationModal from '@/components/AddLocationModal';

// Mock fetch
global.fetch = jest.fn();

// Mock Mapbox geocoding API
const mockMapboxResponse = {
  features: [
    {
      id: 'test-id',
      text: 'Test Address',
      place_name: 'Test Place, Test City',
      center: [2.3522, 48.8566],
      context: [
        { id: 'postcode.123', text: '33000' },
        { id: 'place.456', text: 'Bordeaux' },
      ],
    },
  ],
};

describe('AddLocationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('mapbox.com')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMapboxResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 1, message: 'Location added successfully' }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with all form elements', () => {
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Ajouter un lieu')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom du lieu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rechercher une adresse...')).toBeInTheDocument();
    expect(screen.getByLabelText('Ville')).toBeInTheDocument();
    expect(screen.getByLabelText('Code postal')).toBeInTheDocument();
    // Default location_type is OTHER, so the Select shows its label "Autre".
    expect(screen.getByText('Autre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('updates name field when user types', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText('Nom du lieu');
    await user.type(nameInput, 'Test Location');

    expect(nameInput).toHaveValue('Test Location');
  });

  it('shows address suggestions when typing in search field', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const searchInput = screen.getByPlaceholderText('Rechercher une adresse...');
    await user.type(searchInput, 'Test Address');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('mapbox.com/geocoding/v5/mapbox.places/Test%20Address.json')
      );
    });
  });

  it('fills form when address suggestion is clicked', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const searchInput = screen.getByPlaceholderText('Rechercher une adresse...');
    await user.type(searchInput, 'Test Address');

    await waitFor(() => {
      expect(screen.getByText('Test Place, Test City')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test Place, Test City'));

    expect(screen.getByDisplayValue('Bordeaux')).toBeInTheDocument();
    expect(screen.getByDisplayValue('33000')).toBeInTheDocument();
  });

  it('changes location type when select is changed', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Open the Base UI Select (currently showing the default "Autre") and pick "Restaurant".
    await user.click(screen.getByText('Autre'));
    await user.click(await screen.findByRole('option', { name: 'Restaurant' }));

    await waitFor(() =>
      expect(document.querySelector('[data-slot="select-value"]')).toHaveTextContent('Restaurant')
    );
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill in the form
    await user.type(screen.getByLabelText('Nom du lieu'), 'Test Location');

    // Search for address and select suggestion
    const searchInput = screen.getByPlaceholderText('Rechercher une adresse...');
    await user.type(searchInput, 'Test Address');

    await waitFor(() => {
      expect(screen.getByText('Test Place, Test City')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test Place, Test City'));

    // Select location type
    await user.click(screen.getByText('Autre'));
    await user.click(await screen.findByRole('option', { name: 'Restaurant' }));

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Test Location',
          description: '',
          address: 'Test Address',
          zip_code: 33000,
          city: 'Bordeaux',
          latitude: '48.8566',
          longitude: '2.3522',
          location_type: 'RESTAURANT',
        }),
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles form submission error', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('mapbox.com')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMapboxResponse,
        });
      }
      return Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });
    });

    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill in the form
    await user.type(screen.getByLabelText('Nom du lieu'), 'Test Location');

    // Search for address and select suggestion
    const searchInput = screen.getByPlaceholderText('Rechercher une adresse...');
    await user.type(searchInput, 'Test Address');

    await waitFor(() => {
      expect(screen.getByText('Test Place, Test City')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test Place, Test City'));

    // Select location type
    await user.click(screen.getByText('Autre'));
    await user.click(await screen.findByRole('option', { name: 'Restaurant' }));

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erreur lors de l'ajout");
    });

    alertSpy.mockRestore();
  });

  it('has correct modal structure and styling', () => {
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const form = dialog.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('space-y-4');
  });

  it('prevents form submission when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<AddLocationModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    // Should not call API if required fields are empty
    expect(fetch).not.toHaveBeenCalledWith('/api/locations', expect.anything());
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
