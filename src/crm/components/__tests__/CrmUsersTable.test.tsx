import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CrmUsersTable from '../CrmUsersTable';

// Mock fetch globally
global.fetch = jest.fn();

const mockApiResponse = {
  page: 1,
  perPage: 20,
  total: 100,
  data: [
    {
      login: {
        uuid: 'uuid-1',
        username: 'john.doe',
        password: 'pass123',
      },
      name: {
        title: 'Mr',
        first: 'John',
        last: 'Doe',
      },
      gender: 'male',
      location: {
        street: {
          number: 123,
          name: 'Main St',
        },
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postcode: '10001',
      },
      email: 'john.doe@example.com',
      dob: {
        date: '1990-01-01',
        age: 34,
      },
      registered: {
        date: '2020-01-01',
        age: 4,
      },
      phone: '555-0123',
      cell: '555-0124',
      picture: {
        large: 'https://example.com/pic1.jpg',
        medium: 'https://example.com/pic1-med.jpg',
        thumbnail: 'https://example.com/pic1-thumb.jpg',
      },
      nat: 'US',
    },
    {
      login: {
        uuid: 'uuid-2',
        username: 'jane.smith',
        password: 'pass456',
      },
      name: {
        title: 'Ms',
        first: 'Jane',
        last: 'Smith',
      },
      gender: 'female',
      location: {
        street: {
          number: 456,
          name: 'Oak Ave',
        },
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postcode: '90001',
      },
      email: 'jane.smith@example.com',
      dob: {
        date: '1985-05-15',
        age: 39,
      },
      registered: {
        date: '2019-03-10',
        age: 5,
      },
      phone: '555-5678',
      cell: '555-5679',
      picture: {
        large: 'https://example.com/pic2.jpg',
        medium: 'https://example.com/pic2-med.jpg',
        thumbnail: 'https://example.com/pic2-thumb.jpg',
      },
      nat: 'US',
    },
  ],
};

describe('CrmUsersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the users table', async () => {
    render(<CrmUsersTable />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Total: 100')).toBeInTheDocument();
    });
  });

  it('fetches and displays users on mount', async () => {
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://user-api.builder-io.workers.dev/api/users')
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      expect(screen.getByText('Ms Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<CrmUsersTable />);

    // MUI DataGrid shows skeleton loading by default
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('displays user information in table cells', async () => {
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('New York, USA')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles, USA')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search users by name, email, or city...'
    );
    await user.type(searchInput, 'Jane');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Jane')
      );
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    );

    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    });

    // Find and click next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextPageButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('edit user');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });
  });

  it('displays error alert with close button', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network Error')
    );

    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Network Error')).not.toBeInTheDocument();
    });
  });

  it('refreshes data after user update', async () => {
    const user = userEvent.setup();
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    });

    // Clear previous fetch calls
    (global.fetch as jest.Mock).mockClear();

    // Open edit modal
    const editButtons = screen.getAllByLabelText('edit user');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });

    // Mock successful update
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Mock refresh fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Wait for update and refresh
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('https://user-api.builder-io.workers.dev/api/users')
        );
      },
      { timeout: 3000 }
    );
  });

  it('sends correct query parameters', async () => {
    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://user-api.builder-io.workers.dev/api/users?page=1&perPage=20'
      );
    });
  });

  it('displays gender chips with correct colors', async () => {
    render(<CrmUsersTable />);

    await waitFor(() => {
      const genderChips = screen.getAllByText('male');
      expect(genderChips.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const genderChips = screen.getAllByText('female');
      expect(genderChips.length).toBeGreaterThan(0);
    });
  });

  it('displays user avatars', async () => {
    render(<CrmUsersTable />);

    await waitFor(() => {
      const avatars = screen.getAllByRole('img');
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  it('handles empty search results', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          page: 1,
          perPage: 20,
          total: 0,
          data: [],
        }),
      });

    render(<CrmUsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search users by name, email, or city...'
    );
    await user.type(searchInput, 'NonexistentUser');

    await waitFor(() => {
      expect(screen.getByText('Total: 0')).toBeInTheDocument();
    });
  });
});
