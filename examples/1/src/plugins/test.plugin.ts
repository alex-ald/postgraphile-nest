import { ChangeNullability, SchemaType } from 'postgraphile-nest';
import { Plugin } from 'postgraphile';
import { makeExtendSchemaPlugin, gql } from 'graphile-utils';

@SchemaType('user')
export class TestPlugin {

  @ChangeNullability()
  name() {
    return true;
  }
}
