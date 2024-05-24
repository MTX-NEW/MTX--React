export interface NavBarItem {
  title: string;
  path: string;
  parent: string;
}

export interface SideBarItem {
  title: string;
  path: string;
  icon: string;
  hoverIcon?: string;
}
export interface RadioboxItem {
  value: string;
  label: string;
}

export interface RadioboxGroup {
  items: RadioboxItem[];
  title: string;
}
export interface DropdownItem {
  value: string;
  label: string;
}
export interface Dropdowns {
  items: DropdownItem[];
  title: string;
}
export interface TextBoxItem {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  value: string;
}
export interface UserTableText {
  firstname: string;
  lastname: string;
  email: string;
  phone: any;
  password: string;
  empcode: string;
  hiringdate: string;
  lastemploymentdate: string;
}

export const initialUserTableText: UserTableText = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  empcode: "",
  hiringdate: "",
  lastemploymentdate: "",
};

export interface UserTableRadio {
  sex: any;
  spanishspeaking: any;
  status: any;
  paymentstructure: any;
}
export const initialUserTableRadio: UserTableRadio = {
  sex: "",
  spanishspeaking: "",
  status: "",
  paymentstructure: "",
};

export interface UserTableDrop {
  usergroup: any;
  usertype: any;
}
export const iniitalUserTableDrop: UserTableDrop = {
  usergroup: "",
  usertype: "",
};

export interface UserProgramText {
  programid: any;
  programname: string;
  companyid: any;
  companyname: string;
  address: string;
  city: string;
  state: string;
  postalcode: any;
  phoneno: any;
}
export const initialUserProgramText: UserProgramText = {
  programid: 0,
  programname: "",
  companyid: 0,
  companyname: "",
  address: "",
  city: "",
  state: "",
  postalcode: 0,
  phoneno: "",
};

export interface UserTypeText {
  typeid: any;
  typename: string;
  displayname: string;
}
export interface UserTypeRadio {
  status: string;
}

export const initialUserTypeText: UserTypeText = {
  typeid: 0,
  typename: "",
  displayname: "",
};
export const initialUserTypeRadio: UserTypeRadio = {
  status: "",
};

export interface UserGroupText {
  groupid: any;
  fullname: string;
  commonname: string;
  shortname: string;
  phone: any;
  email: string;
  parentid: any;
}
export interface UserGroupRadio {
  status: string;
  sendpdf: any;
}

export const initialUserGroupText: UserGroupText = {
  groupid: 0,
  fullname: "",
  commonname: "",
  shortname: "",
  phone: "",
  email: "",
  parentid: 0,
};
export const initialUserGroupRadio: UserGroupRadio = {
  status: "",
  sendpdf: "",
};
