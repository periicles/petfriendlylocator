import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/login/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByText('Pas encore de compte ?')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
  });

  it('updates input values when typing', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls signIn with correct credentials when login button is clicked', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'testpass');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'user@test.com',
        password: 'testpass',
        callbackUrl: '/',
        redirect: false,
      });
    });
  });

  it('calls signIn with empty credentials when fields are empty', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'Se connecter' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: '',
        password: '',
        callbackUrl: '/',
        redirect: false,
      });
    });
  });

  it('handles signIn rejection gracefully', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'wrongpass');

    // Click the login button
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue lors de la connexion')).toBeInTheDocument();
    });

    // Component should still be rendered and functional
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(loginButton).toBeEnabled();
  });

  it('handles signIn error result gracefully', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'wrongpass');

    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
    });

    expect(loginButton).toBeEnabled();
  });

  it('shows loading state during sign in', async () => {
    const user = userEvent.setup();
    let resolveSignIn: () => void;
    const signInPromise = new Promise<void>((resolve) => {
      resolveSignIn = resolve;
    });
    mockSignIn.mockReturnValueOnce(signInPromise);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button');

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'password');

    await user.click(loginButton);

    // Check loading state
    expect(screen.getByText('Connexion...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    // Resolve the promise
    resolveSignIn!();

    await waitFor(() => {
      expect(screen.getByText('Se connecter')).toBeInTheDocument();
      expect(loginButton).toBeEnabled();
    });
  });

  it('clears error when attempting new login', async () => {
    const user = userEvent.setup();
    // First, trigger an error
    mockSignIn.mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue lors de la connexion')).toBeInTheDocument();
    });

    // Now mock a successful login
    mockSignIn.mockResolvedValueOnce(undefined);

    // Try again
    await user.click(loginButton);

    // Error should be cleared during loading
    await waitFor(() => {
      expect(
        screen.queryByText('Une erreur est survenue lors de la connexion')
      ).not.toBeInTheDocument();
    });
  });

  it('maintains separate state for email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    // Type in email field
    await user.type(emailInput, 'first@test.com');
    expect(emailInput).toHaveValue('first@test.com');
    expect(passwordInput).toHaveValue('');

    // Type in password field
    await user.type(passwordInput, 'mypassword');
    expect(emailInput).toHaveValue('first@test.com');
    expect(passwordInput).toHaveValue('mypassword');

    // Clear email and type new value
    await user.clear(emailInput);
    await user.type(emailInput, 'second@test.com');
    expect(emailInput).toHaveValue('second@test.com');
    expect(passwordInput).toHaveValue('mypassword'); // Should remain unchanged
  });

  it('has correct input field attributes', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has correct link to register page', () => {
    render(<LoginPage />);

    const registerLink = screen.getByText('Créer un compte');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('has correct CSS classes and structure', () => {
    const { container } = render(<LoginPage />);

    // Check main container classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',
      'bg-gray-100',
      'px-4'
    );

    // Check form container classes
    const formContainer = screen.getByText('Connexion').closest('div');
    expect(formContainer).toHaveClass(
      'w-full',
      'max-w-md',
      'bg-white',
      'border',
      'border-gray-300',
      'rounded-lg',
      'shadow',
      'p-6'
    );

    // Check heading classes
    const heading = screen.getByText('Connexion');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-6', 'text-gray-800', 'text-center');
    expect(heading.tagName).toBe('H1');
  });

  it('has correct button classes and structure', () => {
    render(<LoginPage />);

    const button = screen.getByRole('button', { name: 'Se connecter' });
    expect(button).toHaveClass(
      'w-full',
      'bg-blue-600',
      'text-white',
      'font-semibold',
      'py-2',
      'rounded',
      'hover:bg-blue-700',
      'transition'
    );
  });

  it('has correct input field classes', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    const expectedClasses = [
      'w-full',
      'border',
      'border-gray-400',
      'text-gray-800',
      'bg-white',
      'rounded',
      'px-3',
      'py-2',
      'mb-4',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
    ];

    expectedClasses.forEach((className) => {
      expect(emailInput).toHaveClass(className);
      expect(passwordInput).toHaveClass(className);
    });
  });

  it('handles multiple login attempts correctly', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    // First login attempt
    await user.type(emailInput, 'first@test.com');
    await user.type(passwordInput, 'pass1');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'first@test.com',
        password: 'pass1',
        callbackUrl: '/',
        redirect: false,
      });
    });

    // Clear and try again
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'second@test.com');
    await user.type(passwordInput, 'pass2');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'second@test.com',
        password: 'pass2',
        callbackUrl: '/',
        redirect: false,
      });
    });

    expect(mockSignIn).toHaveBeenCalledTimes(2);
  });

  it('displays all text content correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Pas encore de compte ?')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
  });
});
