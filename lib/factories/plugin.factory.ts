import {
  makeChangeNullabilityPlugin,
  makeWrapResolversPlugin,
  makeExtendSchemaPlugin,
  makeAddInflectorsPlugin,
  makeProcessSchemaPlugin,
  gql } from 'graphile-utils';
import { ResolverWrapperRequirements } from '../interfaces/wrap-resolver-requirements.interface';
import { isNil } from 'lodash';

/**
 * Factory for easier creation of PostGraphile plugins
 */
export class PluginFactory {

  public static createChangeNullabilityPlugin(
    typeName: string,
    fieldName: string,
    isNullable: boolean,
  ) {
    if (!typeName || !fieldName) {
      throw new Error('typeName and fieldName are required for ChangeNullability');
    }

    typeName = typeName.trim();
    fieldName = fieldName.trim();

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
    if (!typeName || !fieldName) {
      throw new Error('typeName and fieldName are required for WrapResolver');
    }

    typeName = typeName.trim();
    fieldName = fieldName.trim();

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
    if (!typeName || !fieldName || !fieldType) {
      throw new Error('typeName, fieldName, and fieldType are required for ExtendSchema');
    }

    typeName = typeName.trim();
    fieldName = fieldName.trim();

    const matches = fieldName.match(/^\w+/);

    // If no field name exists, then ignore creating the plugin
    if (isNil(matches)) {
      throw new Error('Unable to create ExtendSchema plugin because a field name'
        + ' was not provided or is not in correct form. fieldname: ' + fieldName);
    }

    const fieldNameWithoutParams = matches[0];
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
            [fieldNameWithoutParams]: async (query, args, context, resolveInfo) => {
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
