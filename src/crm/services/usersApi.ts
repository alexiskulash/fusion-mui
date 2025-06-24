// API service for managing users data from the internal Users API
const BASE_URL = "https://user-api.builder-io.workers.dev/api";

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

export interface UsersApiResponse {
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
  gender?: string;
  location?: {
    street?: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
}

export interface UpdateUserRequest {
  name?: {
    first?: string;
    last?: string;
    title?: string;
  };
  email?: string;
  location?: {
    street?: {
      number?: number;
      name?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  phone?: string;
  cell?: string;
}

// Fetch users with pagination, search, and sorting
export async function fetchUsers(
  page: number = 1,
  perPage: number = 10,
  search?: string,
  sortBy?: string,
  span?: string,
): Promise<UsersApiResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
    });

    if (search) params.append("search", search);
    if (sortBy) params.append("sortBy", sortBy);
    if (span) params.append("span", span);

    const response = await fetch(`${BASE_URL}/users?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Get a specific user by ID/username/email
export async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// Create a new user
export async function createUser(
  userData: CreateUserRequest,
): Promise<{ success: boolean; uuid: string; message: string }> {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Update an existing user
export async function updateUser(
  id: string,
  userData: UpdateUserRequest,
): Promise<{ success: boolean; message: string }> {
  try {
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete a user
export async function deleteUser(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `${BASE_URL}/users/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
