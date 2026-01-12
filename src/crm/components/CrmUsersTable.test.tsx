import * as React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CrmUsersTable from './CrmUsersTable';

// Mock fetch
global.fetch = jest.fn();

const mockUsersResponse = {
  page: 1,
  perPage: 10,
  total: 100,
  span: 'week',
  effectivePage: 1,
  data: [
    {
      login: {
        uuid: 'test-uuid-1',
        username: 'testuser1',
        password: 'password',
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
        coordinates: {
          latitude: 40.7128,
          longitude: -74.006,
        },
        timezone: {
          offset: '-05:00',
          description: 'Eastern Time',
        },
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
        uuid: 'test-uuid-2',
        username: 'testuser2',
        password: 'password',
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
      phone: '555-0456',
      cell: '555-0457',
    },
  ],
};

describe('CrmUsersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUsersResponse,
    });
  });

  describe('Component Rendering', () => {
    it('should render the component with title', async () => {
      render(<CrmUsersTable />);
      
      expect(screen.getByText('Users Management')).toBeInTheDocument();
    });

    it('should render search input', async () => {
      render(<CrmUsersTable />);
      
      const searchInput = screen.getByPlaceholderText('Search users...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      render(<CrmUsersTable />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch users on mount', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users?page=1&perPage=10')
        );
      });
    });

    it('should display fetched users in the table', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
        expect(screen.getByText('Ms Jane Smith')).toBeInTheDocument();
      });

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns error status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch users: Internal Server Error/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when typing in search input', async () => {
      const user = userEvent.setup();
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'john');

      expect(searchInput).toHaveValue('john');
    });

    it('should fetch users with search query', async () => {
      const user = userEvent.setup();
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=john')
        );
      });
    });

    it('should reset page to 0 when searching', async () => {
      const user = userEvent.setup();
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'jane');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.stringContaining('page=1')
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should display total row count', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText(/1–10 of 100/)).toBeInTheDocument();
      });
    });

    it('should change page when pagination controls are used', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const nextPageButton = screen.getByRole('button', {
        name: /go to next page/i,
      });

      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.stringContaining('page=2')
        );
      });
    });

    it('should support different page sizes', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      // Find and click the rows per page dropdown by its label text
      const rowsPerPageElement = screen.getByLabelText(/rows per page:/i);

      fireEvent.mouseDown(rowsPerPageElement);

      // Select 25 rows per page
      const option25 = await screen.findByRole('option', { name: '25' });
      fireEvent.click(option25);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.stringContaining('perPage=25')
        );
      });
    });
  });

  describe('Edit Functionality', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });
    });

    it('should populate edit form with user data', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByDisplayValue('Mr')).toBeInTheDocument();
        expect(within(dialog).getByDisplayValue('John')).toBeInTheDocument();
        expect(within(dialog).getByDisplayValue('Doe')).toBeInTheDocument();
        expect(
          within(dialog).getByDisplayValue('john.doe@example.com')
        ).toBeInTheDocument();
      });
    });

    it('should update form fields when edited', async () => {
      const user = userEvent.setup();
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jonathan');

      expect(firstNameInput).toHaveValue('Jonathan');
    });

    it('should close dialog when cancel is clicked', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should save user changes when save is clicked', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jonathan');

      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users/test-uuid-1'),
          expect.objectContaining({
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    it('should display error when save fails', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsersResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Bad Request',
        });

      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to update user: Bad Request/i)
        ).toBeInTheDocument();
      });
    });

    it('should show loading state while saving', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Mock a slow save response
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      );

      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      fireEvent.click(saveButton);

      // Check for saving state
      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });
  });

  describe('Data Grid Columns', () => {
    it('should display all column headers', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /phone/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /location/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /age/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    });

    it('should format location correctly', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
        expect(screen.getByText('Los Angeles, CA, USA')).toBeInTheDocument();
      });
    });

    it('should display age from dob', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('34')).toBeInTheDocument();
        expect(screen.getByText('39')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', async () => {
      render(<CrmUsersTable />);

      const searchInput = screen.getByPlaceholderText('Search users...');
      expect(searchInput).toHaveAccessibleName();
    });

    it('should have accessible edit buttons', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
      editButtons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should have accessible dialog', async () => {
      render(<CrmUsersTable />);

      await waitFor(() => {
        expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleName();
      });
    });
  });
});
