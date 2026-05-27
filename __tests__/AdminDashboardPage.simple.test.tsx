import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';

global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue([]),
}) as jest.Mock;

describe('AdminDashboardPage (smoke)', () => {
  it('renders without crashing and shows all tabs', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Lieux')).toBeInTheDocument();
    expect(screen.getByText('Avis')).toBeInTheDocument();
  });
});
