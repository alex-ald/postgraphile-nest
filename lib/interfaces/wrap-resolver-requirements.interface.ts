export interface ResolverWrapperRequirementsColumns {
  column: string;
  alias: string;
}

export interface ResolverWrapperRequirements {
  childColumns?: ResolverWrapperRequirementsColumns[];
  siblingColumns?: ResolverWrapperRequirementsColumns[];
}
