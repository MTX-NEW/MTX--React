interface LoginRequest {
  user_name: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface GetUsersResponse {
  users: User[];
}

interface PaginatedReq {
  page: number;
  rowsPerPage: number;
}
