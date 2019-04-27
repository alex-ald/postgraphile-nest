import { makeChangeNullabilityPlugin, makeWrapResolversPlugin } from 'graphile-utils';
import { ResolverWrapperRequirements } from '../interfaces/wrap-resolver-requirements.interface';

/**
 * Factory for easier creation of PostGraphile plugins
 */
export class PluginFactory {

  public static createChangeNullabilityPlugin(
    typeName: string,
    fieldName: string,
    isNullable: boolean,
  ) {
    return makeChangeNullabilityPlugin({
      [typeName]: {
        [fieldName]: isNullable,
      },
    });
  }

  public static createWrapResolverPlugin(
    typeName: string,
    fieldName: string,
    requirements: ResolverWrapperRequirements,
    // tslint:disable-next-line:ban-types
    resolver: Function,
  ) {
    return makeWrapResolversPlugin({
      [typeName]: {
        [fieldName]: {
          requires: requirements,
          // tslint:disable-next-line:ban-types
          resolve: resolver as any,
        },
      },
    });
  }
}
