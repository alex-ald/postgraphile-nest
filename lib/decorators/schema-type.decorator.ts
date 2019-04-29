import { SetMetadata } from '@nestjs/common';
import { SCHEMA_TYPE_METADATA } from '../postgraphile.constants';
import { SchemaTypeOptions } from '../interfaces/schema-type-options.interface';

export function SchemaType(options: SchemaTypeOptions) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    key?: string | symbol,
    descriptor?: any,
  ) => {
    SetMetadata(SCHEMA_TYPE_METADATA, options)(
      target,
      key,
      descriptor,
    );
  };
}
