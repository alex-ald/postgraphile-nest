import { SetMetadata } from '@nestjs/common';
import { PLUGIN_TYPE_METADATA } from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';

export function WrapResolverFilter() {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    propertyKey?: string,
    descriptor?: any,
  ) => {
    SetMetadata(PLUGIN_TYPE_METADATA, PluginType.WRAP_RESOLVER)(
      target,
      propertyKey,
      descriptor,
    );
  };
}
