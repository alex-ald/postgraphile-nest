import { ChangeNullability, SchemaType, WrapResolver } from 'postgraphile-nest';
import { makeExtendSchemaPlugin, gql } from 'graphile-utils';

@SchemaType('User')
export class TestPlugin {

  @ChangeNullability()
  public name() {
    return true;
  }

  @WrapResolver('name', { siblingColumns: [{ column: 'desription', alias: '$desription' }] })
  public alterName(resolver, user, args, context) {
    const result = resolver() as string;

    if ((user.$desription as string).includes('here')) {
      return null;
    } else {
      return result;
    }
  }
}
