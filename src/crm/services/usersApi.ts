import {
  User,
  UsersApiResponse,
  UsersApiParams,
  CreateUserRequest,
  UpdateUserRequest,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "../types/User";

const BASE_URL = "https://user-api.builder-io.workers.dev/api";

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
  }
  return response.json();
}

// Helper function to build query parameters
function buildQueryParams(params: UsersApiParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined)
    searchParams.set("page", params.page.toString());
  if (params.perPage !== undefined)
    searchParams.set("perPage", params.perPage.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.span) searchParams.set("span", params.span);

  return searchParams.toString();
}

export class UsersApiService {
  // Get users with pagination, search, and sorting
  static async getUsers(
    params: UsersApiParams = {},
  ): Promise<UsersApiResponse> {
    const queryString = buildQueryParams(params);
    const url = `${BASE_URL}/users${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url);
    return handleApiResponse<UsersApiResponse>(response);
  }

  // Get a specific user by ID, username, or email
  static async getUser(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`);
    return handleApiResponse<User>(response);
  }

  // Create a new user
  static async createUser(
    userData: CreateUserRequest,
  ): Promise<ApiSuccessResponse> {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleApiResponse<ApiSuccessResponse>(response);
  }

  // Update an existing user
  static async updateUser(
    id: string,
    userData: UpdateUserRequest,
  ): Promise<ApiSuccessResponse> {
    const response = await fetch(
      `${BASE_URL}/users/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );
    return handleApiResponse<ApiSuccessResponse>(response);
  }

  // Delete a user
  static async deleteUser(id: string): Promise<ApiSuccessResponse> {
    const response = await fetch(
      `${BASE_URL}/users/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    return handleApiResponse<ApiSuccessResponse>(response);
  }

  // Search users with debounced search functionality
  static async searchUsers(
    query: string,
    params: Omit<UsersApiParams, "search"> = {},
  ): Promise<UsersApiResponse> {
    return this.getUsers({ ...params, search: query });
  }
}

// Export a default instance for easy use
export const usersApi = UsersApiService;
