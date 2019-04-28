import { Injectable } from '@nestjs/common';
import { AddInflector, ProcessSchema, WrapResolverFilter, ExtendSchema } from '../../lib';

@Injectable()
export class TestPlugin {

  @AddInflector({ inflector: 'patchType' })
  public patchTypeInflector(typeName: string) {
    return `${typeName}-change-set`.toUpperCase();
  }

  @ProcessSchema()
  public nameResolver(schema: any) {
    return 'test';
  }

  @WrapResolverFilter()
  public resolverFilter() {
    return 'test';
  }

  @ExtendSchema({ typeName: 'User', fieldName: 'name', fieldType: 'String'})
  public nameExtendSchema() {
    return 'test';
  }

  public dummyMethod() {
    return 'test';
  }
}
