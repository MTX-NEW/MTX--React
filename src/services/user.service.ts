import { authApi } from "./authApi.service";

export const getAllUsers = async (
  signal: AbortSignal,
  pagination: PaginatedReq
): Promise<{ users: User[]; totalCount: number }> => {
  console.log(pagination);
  const response = await authApi.get(
    `users/get_users?limit=${pagination.rowsPerPage}&page=${pagination.page}`,
    true,
    signal
  );
  let data = response.data;
  let users: User[] = [];
  for (const record of data) {
    users.push({
      id: record.id,
      email: record.email,
      address1: record.address1,
      address2: record.address2,
      city: record.city,
      dob: record.dob,
      createdBy: record.created_by,
      active: record.is_active,
      empCode: record.emp_code,
      firstName: record.firstname,
      lastName: record.lastname,
      gender: record.gender,
      joinDate: record.join_date,
      payStructure: record.pay_structure,
      phoneNumber: record.phone_number,
      password: record.password,
      practiceID: record.practice_id,
      role: record.role,
      state: record.state,
      username: record.username,
      zipcode: record.zipcode,
    });
  }
  return { users: users, totalCount: response.totalCount }; //undefined for now
};
