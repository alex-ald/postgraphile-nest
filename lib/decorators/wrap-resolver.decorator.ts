import { SetMetadata } from '@nestjs/common';
import {
  SCHEMA_TYPE_PLUGIN_METADATA,
  PLUGIN_DETAILS_METADATA,
} from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { WrapResolverOptions } from '../interfaces/wrap-resolver-options.interface';

export function WrapResolver(options: WrapResolverOptions) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    propertyKey?: string,
    descriptor?: any,
  ) => {
    SetMetadata(SCHEMA_TYPE_PLUGIN_METADATA, PluginType.WRAP_RESOLVER)(
      target,
      propertyKey,
      descriptor,
    );

    SetMetadata(PLUGIN_DETAILS_METADATA, options)(
      target,
      propertyKey,
      descriptor,
    );
  };
}
