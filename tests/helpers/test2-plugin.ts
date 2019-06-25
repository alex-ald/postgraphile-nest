import { SchemaType, ChangeNullability, WrapResolver, ExtendSchema } from '../../lib';

@SchemaType({ typeName: 'User' })
export class Test2Plugin {

  @ChangeNullability({ fieldName: 'name' })
  public nameNullability() {
    return true;
  }

  @WrapResolver({ fieldName: 'name' })
  public nameResolver() {
    return 'test';
  }

  @ExtendSchema({ fieldName: 'name2', fieldType: 'String' })
  public addName2Field() {
    return 'test2';
  }

  @ExtendSchema({
    typeName: 'Mutation',
    fieldName: ' registerUser(input: String!)',
    fieldType: 'String',
  })
  public registerUser(_query: any, args: any, resolveInfo: any, { pgSql: sql }: any) {
    return 'testing';
  }
}
