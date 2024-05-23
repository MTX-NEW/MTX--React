import { authApi } from "./authApi.service";

export function login(
  data: LoginRequest
): Promise<{ response: LoginResponse }> {
  let req = { data: data };
  return authApi.post("login", req, "json", false);
}
