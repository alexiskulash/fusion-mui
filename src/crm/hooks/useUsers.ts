import { useState, useEffect, useCallback } from "react";
import {
  usersApi,
  User,
  UsersResponse,
  UpdateUserData,
} from "../services/usersApi";

interface UseUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  refreshUsers: () => void;
  updateUser: (id: string, userData: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export function useUsers({
  page = 1,
  perPage = 10,
  search = "",
  sortBy = "name.first",
}: UseUsersParams = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: UsersResponse = await usersApi.getUsers({
        page: currentPage,
        perPage,
        search,
        sortBy,
      });

      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, sortBy]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const refreshUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(
    async (id: string, userData: UpdateUserData) => {
      try {
        await usersApi.updateUser(id, userData);
        await refreshUsers();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update user",
        );
      }
    },
    [refreshUsers],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await usersApi.deleteUser(id);
        await refreshUsers();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to delete user",
        );
      }
    },
    [refreshUsers],
  );

  const totalPages = Math.ceil(totalUsers / perPage);

  return {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    totalPages,
    refreshUsers,
    updateUser,
    deleteUser,
  };
}
