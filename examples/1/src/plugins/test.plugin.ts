import { AttachPluginCreate, SchemaPlugins, AttachPlugin } from 'postgraphile-nest';
import { Plugin } from 'postgraphile';
import { makeExtendSchemaPlugin, gql } from 'graphile-utils';

@SchemaPlugins()
export class TestPlugin implements AttachPluginCreate {

  @AttachPlugin()
  createPlugin(): Plugin {
    return makeExtendSchemaPlugin(build => {
      const { pgSql: sql } = build;
      return {
        typeDefs: gql`
          extend type Part {
            nameUpper: String @requires(columns: ["name"])
          }
        `,
        resolvers: {
          Part: {
            nameUpper: (product) => {
              const { name } = product;
              return name ? (name as string).toUpperCase() : name;
            },
            },
          },
        };
      });
  }
}
