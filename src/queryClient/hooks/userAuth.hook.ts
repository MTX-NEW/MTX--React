import { useMutation } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";
import { login } from "../../services/userAuth.service";
import { useUser } from "../../store/userContext";

export function useLogin() {
  const { setUser, setToken } = useUser();
  const nav = useNavigate();
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data: { response: LoginResponse }) => {
      if (!data.response.token) {
        throw Error(data + "");
      }
      setUser(data.response.user);
      setToken(data.response.token);
      nav("/main");
    },
    onError: (error: any) => {
      console.log("Error occured", error.message);
    },
  });
}
