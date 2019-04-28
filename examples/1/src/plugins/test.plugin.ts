import { ChangeNullability, SchemaType, WrapResolver, ExtendSchema } from 'postgraphile-nest';
import { makeExtendSchemaPlugin, gql } from 'graphile-utils';

@SchemaType('User')
export class TestPlugin {

  @ChangeNullability({ fieldName: 'name'})
  public name() {
    return true;
  }

  @WrapResolver({ fieldName: 'name', siblingColumns: [{ column: 'desription', alias: '$desription' }] })
  public alterName(resolver, user, args, context) {
    const result = resolver() as string;

    if ((user.$desription as string).includes('here')) {
      return null;
    } else {
      return result;
    }
  }

  @ExtendSchema({ fieldName: 'testField', fieldType: 'String' })
  public testField(_query, args, context, resolveInfo, build) {
    return 'TestField-Value';
  }
}
