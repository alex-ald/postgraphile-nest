import { SetMetadata } from '@nestjs/common';
import { SCHEMA_TYPE_METADATA } from '../postgraphile.constants';

export function SchemaType(typeName: string) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    key?: string | symbol,
    descriptor?: any,
  ) => {
    SetMetadata(SCHEMA_TYPE_METADATA, { typeName })(
      target,
      key,
      descriptor,
    );
  };
}
