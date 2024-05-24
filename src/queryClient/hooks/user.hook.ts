import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../../services/user.service";
import { User } from "../../models/userModel";
import { PaginatedReq } from "../../interfaces/apiTypes";

export function useGetUsers(pagination: PaginatedReq) {
  return useQuery({
    queryKey: ["getUsers"],
    queryFn: ({ signal }) => getAllUsers(signal, pagination),
  }) as UseQueryResult<{ users: User[]; totalCount: number }>;
}
