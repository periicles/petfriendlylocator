import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/login/page';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

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
    expect(screen.getByPlaceholderText('Adresse email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
  });

  it('updates input values when typing', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
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

    const emailInput = screen.getByPlaceholderText('Adresse email');
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

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue lors de la connexion')).toBeInTheDocument();
    });

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(loginButton).toBeEnabled();
  });

  it('handles signIn error result gracefully', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

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

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button');

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'password');
    await user.click(loginButton);

    expect(screen.getByText('Connexion...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    resolveSignIn!();

    await waitFor(() => {
      expect(screen.getByText('Se connecter')).toBeInTheDocument();
      expect(loginButton).toBeEnabled();
    });
  });

  it('clears error when attempting new login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue lors de la connexion')).toBeInTheDocument();
    });

    mockSignIn.mockResolvedValueOnce(undefined);
    await user.click(loginButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Une erreur est survenue lors de la connexion')
      ).not.toBeInTheDocument();
    });
  });

  it('maintains separate state for email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    await user.type(emailInput, 'first@test.com');
    expect(emailInput).toHaveValue('first@test.com');
    expect(passwordInput).toHaveValue('');

    await user.type(passwordInput, 'mypassword');
    expect(emailInput).toHaveValue('first@test.com');
    expect(passwordInput).toHaveValue('mypassword');

    await user.clear(emailInput);
    await user.type(emailInput, 'second@test.com');
    expect(emailInput).toHaveValue('second@test.com');
    expect(passwordInput).toHaveValue('mypassword');
  });

  it('has correct input field attributes', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has correct link to register page', () => {
    render(<LoginPage />);

    const registerLink = screen.getByText('Créer un compte');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('has correct link to forgot password page', () => {
    render(<LoginPage />);

    const forgotLink = screen.getByText('Mot de passe oublié ?');
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  it('has correct CSS classes on main container', () => {
    const { container } = render(<LoginPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',
      'px-4'
    );
  });

  it('has correct CSS classes on form container', () => {
    render(<LoginPage />);

    const card = screen.getByText('Connexion').closest('[data-slot="card"]');
    expect(card).toHaveClass('w-full', 'max-w-sm');
  });

  it('renders the title with the card-title slot', () => {
    render(<LoginPage />);

    const heading = screen.getByText('Connexion');
    expect(heading).toHaveClass('text-xl');
    expect(heading).toHaveAttribute('data-slot', 'card-title');
  });

  it('has correct button classes', () => {
    render(<LoginPage />);

    const button = screen.getByRole('button', { name: 'Se connecter' });
    expect(button).toHaveClass('w-full', 'bg-primary', 'text-primary-foreground');
  });

  it('has correct input field classes', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    const expectedClasses = ['w-full', 'border', 'border-input', 'rounded-lg'];

    expectedClasses.forEach((className) => {
      expect(emailInput).toHaveClass(className);
      expect(passwordInput).toHaveClass(className);
    });
  });

  it('handles multiple login attempts correctly', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Adresse email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });

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
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Adresse email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
  });
});
