interface UserLogin {
  uuid: string;
  username: string;
  password: string;
}

interface UserName {
  title: string;
  first: string;
  last: string;
}

interface UserStreet {
  number: number;
  name: string;
}

interface UserCoordinates {
  latitude: number;
  longitude: number;
}

interface UserTimezone {
  offset: string;
  description: string;
}

interface UserLocation {
  street: UserStreet;
  city: string;
  state: string;
  country: string;
  postcode: string;
  coordinates: UserCoordinates;
  timezone: UserTimezone;
}

interface UserDob {
  date: string;
  age: number;
}

interface UserRegistered {
  date: string;
  age: number;
}

interface UserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface User {
  login: UserLogin;
  name: UserName;
  gender: string;
  location: UserLocation;
  email: string;
  dob: UserDob;
  registered: UserRegistered;
  phone: string;
  cell: string;
  picture: UserPicture;
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
    state?: string;
    country?: string;
    postcode?: string;
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
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  phone?: string;
  cell?: string;
}

const BASE_URL = "https://user-api.builder-io.workers.dev/api";

export class UserService {
  static async getUsers(
    params: {
      page?: number;
      perPage?: number;
      search?: string;
      sortBy?: string;
      span?: string;
    } = {},
  ): Promise<UsersApiResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.perPage)
      searchParams.append("perPage", params.perPage.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.span) searchParams.append("span", params.span);

    const url = `${BASE_URL}/users${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  static async getUserById(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  static async createUser(
    userData: CreateUserRequest,
  ): Promise<{ success: boolean; uuid: string; message: string }> {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  static async updateUser(
    id: string,
    userData: UpdateUserRequest,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  static async deleteUser(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    return response.json();
  }
}
