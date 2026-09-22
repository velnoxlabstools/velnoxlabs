export type AppRouteType = 'static' | 'tool' | 'category' | 'search' | 'collection';

export interface AppRoute {
  path: string;
  type: AppRouteType;
  slug?: string;
  title: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface ResolvedRoute {
  route: AppRoute;
  breadcrumbs: { label: string; href?: string }[];
}
