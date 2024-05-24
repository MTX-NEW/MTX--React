import { User } from "../models/userModel";

export interface LoginRequest {
  user_name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface GetUsersResponse {
  users: User[];
}

export interface PaginatedReq {
  page: number;
  rowsPerPage: number;
}
