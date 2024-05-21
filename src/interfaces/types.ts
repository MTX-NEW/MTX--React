interface NavBarItem {
  title: string;
  path: string;
  parent: string;
}

interface SideBarItem {
  title: string;
  path: string;
  icon: string;
  hoverIcon?: string;
}
interface RadioboxItem {
  value: string;
  label: string;
}

interface RadioboxGroup {
  items: RadioboxItem[];
  title: string;
}
interface DropdownItem {
  value: string;
  label: string;
}
interface Dropdowns {
  items: DropdownItem[];
  title: string;
}
