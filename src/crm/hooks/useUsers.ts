import { useState, useEffect, useCallback } from 'react';

export interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

export interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

const API_BASE_URL = 'https://user-api.builder-io.workers.dev/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name.first');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        sortBy,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data: UsersResponse = await response.json();
      setUsers(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm, sortBy]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      // Refresh the users list after successful update
      await fetchUsers();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      // Refresh the users list after successful deletion
      await fetchUsers();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    page,
    perPage,
    total,
    searchTerm,
    sortBy,
    setPage,
    setPerPage,
    setSearchTerm,
    setSortBy,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}
