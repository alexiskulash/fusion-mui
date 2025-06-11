import {
  User,
  UsersApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "../types/user";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export class UsersApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "UsersApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new UsersApiError(errorData.error, response.status);
  }
  return response.json();
}

export const usersApi = {
  /**
   * Get paginated list of users with optional search and sorting
   */
  async getUsers(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    span?: "week" | "month";
  }): Promise<UsersApiResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.perPage)
      searchParams.append("perPage", params.perPage.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.span) searchParams.append("span", params.span);

    const url = `${API_BASE_URL}/users${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await fetch(url);
    return handleResponse<UsersApiResponse>(response);
  },

  /**
   * Get a specific user by UUID, username, or email
   */
  async getUser(id: string): Promise<User> {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
    );
    return handleResponse<User>(response);
  },

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<ApiSuccessResponse> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse<ApiSuccessResponse>(response);
  },

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    userData: UpdateUserRequest,
  ): Promise<ApiSuccessResponse> {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );
    return handleResponse<ApiSuccessResponse>(response);
  },

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiSuccessResponse> {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    return handleResponse<ApiSuccessResponse>(response);
  },
};
