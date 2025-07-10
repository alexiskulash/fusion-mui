export interface UserLogin {
  uuid: string;
  username: string;
  password: string;
}

export interface UserName {
  title: string;
  first: string;
  last: string;
}

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

export interface UserDateOfBirth {
  date: string;
  age: number;
}

export interface UserRegistered {
  date: string;
  age: number;
}

export interface UserPicture {
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
  dob: UserDateOfBirth;
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

export interface UsersApiParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  span?: "week" | "month";
}

export interface CreateUserRequest {
  email: string;
  login: {
    username: string;
    password: string;
  };
  name: {
    first: string;
    last: string;
    title: string;
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
  };
}

export interface UpdateUserRequest {
  name?: Partial<UserName>;
  location?: Partial<UserLocation>;
  email?: string;
  phone?: string;
  cell?: string;
}

export interface ApiSuccessResponse {
  success: boolean;
  message: string;
  uuid?: string;
}

export interface ApiErrorResponse {
  error: string;
}
