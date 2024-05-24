export interface User {
  id?: number;
  empCode: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  phoneNumber: any;
  martialStatus?: string;
  joinDate: string;
  username: string;
  password: string;
  active: boolean;
  role: number;
  payStructure: number;
  practiceID: number;
  createdBy: number;
}

export const initialUser: User = {
  empCode: "",
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  dob: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zipcode: "",
  phoneNumber: "",
  martialStatus: "",
  joinDate: "",
  username: "",
  password: "",
  active: false,
  role: 0,
  payStructure: 0,
  practiceID: 0,
  createdBy: 0,
};
