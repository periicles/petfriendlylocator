import { render, screen } from '@testing-library/react';
import { getServerSession } from 'next-auth';
import ProfilePage from '@/app/profile/page';
import { authOptions } from '@/lib/authOptions';

// Mock getServerSession from next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock authOptions
jest.mock('@/lib/authOptions', () => ({
  authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user profile when session exists', async () => {
    // Mock authenticated session
    const mockSession = {
      user: {
        id: 'user123',
        email: 'john.doe@example.com',
        pseudo: 'johndoe',
        name: 'johndoe',
      },
      expires: '2024-12-31',
    };

    mockGetServerSession.mockResolvedValueOnce(mockSession);

    const ProfilePageComponent = await ProfilePage();
    render(ProfilePageComponent);

    // Check that the profile page is rendered
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();

    // Check the structure
    expect(screen.getByText('Pseudo :')).toBeInTheDocument();
    expect(screen.getByText('Email :')).toBeInTheDocument();
  });

  it('renders access denied when no session exists', async () => {
    // Mock no session (null)
    mockGetServerSession.mockResolvedValueOnce(null);

    const ProfilePageComponent = await ProfilePage();
    render(ProfilePageComponent);

    // Check that access denied message is shown
    expect(screen.getByText('Accès refusé')).toBeInTheDocument();

    // Check that profile content is not rendered
    expect(screen.queryByText('Mon Profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Pseudo :')).not.toBeInTheDocument();
    expect(screen.queryByText('Email :')).not.toBeInTheDocument();
  });

  it('calls getServerSession with correct authOptions', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    await ProfilePage();

    // Verify that getServerSession was called with authOptions
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });

  it('handles session with missing user data gracefully', async () => {
    // Mock session with undefined user data
    const mockSession = {
      user: {
        id: 'user123',
        email: undefined,
        pseudo: undefined,
        name: undefined,
      },
      expires: '2024-12-31',
    };

    mockGetServerSession.mockResolvedValueOnce(mockSession);

    const ProfilePageComponent = await ProfilePage();
    render(ProfilePageComponent);

    // Check that the profile page is rendered even with missing data
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    expect(screen.getByText('Pseudo :')).toBeInTheDocument();
    expect(screen.getByText('Email :')).toBeInTheDocument();

    // The content should be empty but structure should be there
    const pseudoElement = screen.getByText('Pseudo :').closest('p');
    const emailElement = screen.getByText('Email :').closest('p');

    expect(pseudoElement).toBeInTheDocument();
    expect(emailElement).toBeInTheDocument();
  });

  it('handles session with partial user data', async () => {
    // Mock session with only email
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        pseudo: undefined,
        name: undefined,
      },
      expires: '2024-12-31',
    };

    mockGetServerSession.mockResolvedValueOnce(mockSession);

    const ProfilePageComponent = await ProfilePage();
    render(ProfilePageComponent);

    // Check that available data is displayed
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Pseudo :')).toBeInTheDocument();
    expect(screen.getByText('Email :')).toBeInTheDocument();
  });

  it('has correct CSS classes and structure', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'style@test.com',
        pseudo: 'styletest',
        name: 'styletest',
      },
      expires: '2024-12-31',
    };

    mockGetServerSession.mockResolvedValueOnce(mockSession);

    const ProfilePageComponent = await ProfilePage();
    const { container } = render(ProfilePageComponent);

    // Check the main container has correct classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'max-w-xl',
      'mx-auto',
      'mt-20',
      'p-6',
      'border',
      'rounded',
      'shadow'
    );

    // Check the heading has correct classes
    const heading = screen.getByText('Mon Profil');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-4');
    expect(heading.tagName).toBe('H1');

    // Check that paragraphs exist
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2); // One for pseudo, one for email
  });

  it('displays user information in correct format', async () => {
    const mockSession = {
      user: {
        id: 'user456',
        email: 'format@test.com',
        pseudo: 'formattest',
        name: 'formattest',
      },
      expires: '2024-12-31',
    };

    mockGetServerSession.mockResolvedValueOnce(mockSession);

    const ProfilePageComponent = await ProfilePage();
    render(ProfilePageComponent);

    // Check that the format includes strong tags for labels
    const strongElements = screen.getAllByText(/^(Pseudo|Email) :$/);
    expect(strongElements).toHaveLength(2);

    strongElements.forEach((element) => {
      expect(element.tagName).toBe('STRONG');
    });

    // Check that user data appears after the labels
    expect(screen.getByText('formattest')).toBeInTheDocument();
    expect(screen.getByText('format@test.com')).toBeInTheDocument();
  });

  it('handles session with null user object', async () => {
    // Mock session with null user
    const mockSession = {
      user: null,
      expires: '2024-12-31',
    };

    mockGetServerSession.mockResolvedValueOnce(mockSession);

    const ProfilePageComponent = await ProfilePage();
    render(ProfilePageComponent);

    // Should still render the profile page structure
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    expect(screen.getByText('Pseudo :')).toBeInTheDocument();
    expect(screen.getByText('Email :')).toBeInTheDocument();
  });

  it('handles getServerSession error gracefully', async () => {
    // Mock getServerSession to throw an error
    mockGetServerSession.mockRejectedValueOnce(new Error('Session error'));

    // This should throw an error since the component doesn't handle it
    await expect(ProfilePage()).rejects.toThrow('Session error');
  });
});
