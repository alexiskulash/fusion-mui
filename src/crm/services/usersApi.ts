// User API service for CRM integration
// Base URL: https://user-api.builder-io.workers.dev/api

export interface User {
  login: {
    uuid: string;
    username: string;
    password?: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: "male" | "female";
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone?: {
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

export interface CreateUserRequest {
  email: string;
  login: {
    username: string;
    password?: string;
  };
  name: {
    first: string;
    last: string;
    title?: string;
  };
  gender?: "male" | "female";
  location?: {
    street?: {
      number: number;
      name: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export interface ApiResponse {
  success: boolean;
  message: string;
  uuid?: string;
}

const BASE_URL = "https://user-api.builder-io.workers.dev/api";

class UsersApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getUsers(
    params: {
      page?: number;
      perPage?: number;
      search?: string;
      sortBy?: string;
      span?: "week" | "month";
    } = {},
  ): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.perPage)
      queryParams.append("perPage", params.perPage.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.span) queryParams.append("span", params.span);

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.fetchApi<UsersResponse>(endpoint);
  }

  async getUser(id: string): Promise<User> {
    return this.fetchApi<User>(`/users/${encodeURIComponent(id)}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    id: string,
    userData: UpdateUserRequest,
  ): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>(`/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}

export const usersApi = new UsersApiService();
