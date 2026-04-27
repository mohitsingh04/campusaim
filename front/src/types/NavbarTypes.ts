export interface NavbarMegaMenuLink {
  name: string;
  href?: string;
}

export interface NavbarMegaMenuSection {
  title: string;
  links: NavbarMegaMenuLink[];
  viewAll?: string;
}

export type NavbarMegaMenuGroup = Record<string, NavbarMegaMenuSection>;

export interface NavbarDropdownContentProps {
  [key: string]: NavbarMegaMenuGroup;
}
export interface NavbarMenuItemProps {
  name: string;
  href: string;
  dropdownContent?: NavbarDropdownContentProps;
  external?: boolean;
}

export interface NavbarMobileDetailMenuState {
  title: string;
  data: NavbarMegaMenuGroup;
}
export interface NavbarMobileSubMenuState {
  title: string;
  data: NavbarDropdownContentProps;
}
