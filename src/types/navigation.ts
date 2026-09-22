export type NavItemType = 'link' | 'group' | 'mega';

export interface NavLink {
  id: string;
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  disabled?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  href?: string;
  items: NavLink[];
  type?: NavItemType;
}

export interface MegaMenuColumn {
  id: string;
  title: string;
  items: NavLink[];
}

export interface MegaMenuItem {
  id: string;
  label: string;
  href?: string;
  columns: MegaMenuColumn[];
  type: 'mega';
}

export type PrimaryNavItem = NavLink | NavGroup | MegaMenuItem;

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: NavLink[];
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface NavigationConfig {
  primary: PrimaryNavItem[];
  secondary: NavLink[];
  footer: FooterLinkGroup[];
  legal: NavLink[];
  social: SocialLink[];
  cta?: NavLink;
}
