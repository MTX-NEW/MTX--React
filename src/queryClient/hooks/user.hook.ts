import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../../services/user.service";

export function useGetUsers(pagination: PaginatedReq) {
  return useQuery({
    queryKey: ["getUsers"],
    queryFn: ({ signal }) => getAllUsers(signal, pagination),
  }) as UseQueryResult<{ users: User[]; totalCount: number }>;
}
