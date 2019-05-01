import {
  makeChangeNullabilityPlugin,
  makeWrapResolversPlugin,
  makeExtendSchemaPlugin,
  makeAddInflectorsPlugin,
  makeProcessSchemaPlugin,
  gql } from 'graphile-utils';
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

  public static createProcessSchemaPlugin(method: (...args: any[]) => any) {
    return makeProcessSchemaPlugin(method);
  }

  public static createExtendSchemaPlugin(
    typeName: string,
    fieldName: string,
    fieldType: string,
    // tslint:disable-next-line:ban-types
    resolver: Function,
    additionalGraphql = '',
  ) {
    return makeExtendSchemaPlugin(build => {
      return {
        typeDefs: gql`
          ${additionalGraphql}

          extend type ${typeName} {
            ${fieldName}: ${fieldType}
          }
        `,
        resolvers: {
          [typeName]: {
            [fieldName]: async (query, args, context, resolveInfo) => {
              return await resolver(query, args, context, resolveInfo, build);
            },
          },
        },
      };
    });
  }

  public static createAddInflectorsPlugin(
    inflectorName: string,
    method: (...args: any[]) => any,
    overwriteExisting?: boolean,
  ) {
    return makeAddInflectorsPlugin(
      { [inflectorName]: method },
      overwriteExisting,
    );
  }
}
