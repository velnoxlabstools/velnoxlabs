export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string | number;

export type {
  LayoutVariant,
  ContentWidth,
  PageWrapperProps,
  MainContentProps,
  SectionWrapperProps,
  AppShellProps,
  GlobalContainerProps,
} from './layout';

export type {
  NavItemType,
  NavLink,
  NavGroup,
  MegaMenuColumn,
  MegaMenuItem,
  PrimaryNavItem,
  FooterLinkGroup,
  SocialLink,
  NavigationConfig,
} from './navigation';

export type {
  ToolStatus,
  Tool,
  Category,
  ToolCollection,
  HomepageStats,
  HomepageFaqItem,
  HomepageCta,
  HomepageSectionId,
  HomepageSectionConfig,
  HomepageConfig,
  HomepageData,
} from './tools';

export type {
  CategorySortKey,
  CategoryFilterKey,
  CategoryListParams,
  CategoryListResult,
  CategoryDetail,
  CategoryPageConfig,
} from './category-page';

export type {
  ToolLifecycleStatus,
  ToolMetadata,
  ToolVersion,
  ToolConfig,
  ToolStats,
  ToolSortKey,
  ToolListParams,
  ToolListResult,
  RelatedToolsResult,
  ToolEngineConfig,
} from './tool-engine';

export type {
  SearchResultType,
  SearchDocument,
  SearchHit,
  SearchResult,
  SearchSortKey,
  SearchParams,
  SearchIndexStats,
} from './search';

export type {
  AppRouteType,
  AppRoute,
  ResolvedRoute,
} from './routing';

export type {
  ToolInputType,
  ToolOutputType,
  SelectOption,
  ToolInputField,
  ToolOutputField,
  ToolActionDef,
  ToolInterfaceSchema,
  ToolFieldValues,
  ToolRunState,
} from './tool-interface';
