import { Injectable } from '@nestjs/common';
import { AddInflector, ProcessSchema, ExtendSchema } from '../../lib';

@Injectable()
export class Test3Plugin {

  @ExtendSchema({
    typeName: 'Mutation',
    fieldName: '.registerUser(input: String!)',
    fieldType: 'String',
  })
  public registerUser(_query: any, args: any, resolveInfo: any, { pgSql: sql }: any) {
    return 'testing';
  }
}
