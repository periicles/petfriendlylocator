/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);

    expect(screen.getByText('🐾 Pet Friendly Locator')).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    render(<HomePage />);

    // Section 1 - Main title
    expect(screen.getByText('🐾 Pet Friendly Locator')).toBeInTheDocument();
    expect(
      screen.getByText(/Une application pour découvrir et partager les lieux accueillants/)
    ).toBeInTheDocument();

    // Section 2 - How it works
    expect(screen.getByText('🧭 Comment ça fonctionne')).toBeInTheDocument();
    expect(screen.getByText(/Explorez une carte interactive/)).toBeInTheDocument();

    // Section 3 - Contact
    expect(screen.getByText('📬 Me contacter')).toBeInTheDocument();
  });

  it('has correct responsive structure', () => {
    const { container } = render(<HomePage />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'text-center',
      'space-y-32',
      'px-4',
      'py-16',
      'md:py-32',
      'max-w-4xl',
      'mx-auto',
      'bg-vintage-light',
      'text-vintage-black'
    );
  });

  it('contains proper semantic sections', () => {
    render(<HomePage />);

    const sections = screen.getAllByRole('generic');
    expect(sections.length).toBeGreaterThan(0);

    // Check that all three main sections exist
    expect(screen.getByText('🐾 Pet Friendly Locator')).toBeInTheDocument();
    expect(screen.getByText('🧭 Comment ça fonctionne')).toBeInTheDocument();
    expect(screen.getByText('📬 Me contacter')).toBeInTheDocument();
  });

  it('displays proper heading hierarchy', () => {
    render(<HomePage />);

    // Main title should be h2 (since h1 is typically in layout)
    const mainHeading = screen.getByRole('heading', { level: 2, name: '🐾 Pet Friendly Locator' });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveClass('text-3xl', 'md:text-5xl', 'font-bold');

    // Other headings should also be h2
    const howItWorksHeading = screen.getByRole('heading', {
      level: 2,
      name: '🧭 Comment ça fonctionne',
    });
    expect(howItWorksHeading).toBeInTheDocument();
    expect(howItWorksHeading).toHaveClass('text-3xl', 'md:text-4xl', 'font-bold');

    const contactHeading = screen.getByRole('heading', { level: 2, name: '📬 Me contacter' });
    expect(contactHeading).toBeInTheDocument();
    expect(contactHeading).toHaveClass('text-3xl', 'md:text-4xl', 'font-bold');
  });

  it('uses vintage color scheme', () => {
    const { container } = render(<HomePage />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('bg-vintage-light', 'text-vintage-black');

    // Check that paragraphs have the correct text color
    const paragraphs = screen.getAllByText(/^(?!.*📬|.*🧭|.*🐾).+/);
    paragraphs.forEach((paragraph) => {
      if (paragraph.tagName === 'P') {
        expect(paragraph).toHaveClass('text-vintage-taupe');
      }
    });
  });

  it('has proper spacing between sections', () => {
    const { container } = render(<HomePage />);

    const sections = container.querySelectorAll('section');
    sections.forEach((section) => {
      expect(section).toHaveClass('space-y-4');
    });
  });

  it('renders content about Pet Friendly Locator', () => {
    render(<HomePage />);

    expect(
      screen.getByText(
        /Une application pour découvrir et partager les lieux accueillants pour vos animaux dans la région de Bordeaux/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Explorez une carte interactive, ajoutez des lieux, laissez des avis et aidez la communauté à trouver les meilleurs spots pet friendly/
      )
    ).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<HomePage />);
    expect(container.firstChild).toBeTruthy();
  });
});
