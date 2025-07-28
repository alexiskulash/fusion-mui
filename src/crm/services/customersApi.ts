const API_BASE_URL = 'https://user-api.builder-io.workers.dev/api';

export interface UserLocation {
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
}

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
  location: UserLocation;
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

export interface CustomerFilters {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  span?: 'week' | 'month';
}

export class CustomersApi {
  static async getCustomers(filters: CustomerFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.perPage) params.append('perPage', filters.perPage.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.span) params.append('span', filters.span);

    const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async getCustomer(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async createCustomer(customer: Partial<User>): Promise<{ success: boolean; uuid: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create customer: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async updateCustomer(id: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update customer: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete customer: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
