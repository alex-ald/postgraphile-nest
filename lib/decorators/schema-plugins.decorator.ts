import { SetMetadata } from '@nestjs/common';
import { SCHEMA_PLUGINS_METADATA } from '../postgraphile.constants';

export function SchemaPlugins() {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    key?: string | symbol,
    descriptor?: any,
  ) => {
    SetMetadata(SCHEMA_PLUGINS_METADATA, true)(
      target,
      key,
      descriptor,
    );
  };
}
