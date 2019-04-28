import { SetMetadata } from '@nestjs/common';
import { SCHEMA_TYPE_PLUGIN_METADATA, PLUGIN_DETAILS_METADATA } from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { ChangeNullabilityOptions } from '../interfaces/change-nullability-options.interface';

export function ChangeNullability(options: ChangeNullabilityOptions) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    propertyKey?: string,
    descriptor?: any,
  ) => {
    SetMetadata(SCHEMA_TYPE_PLUGIN_METADATA, PluginType.CHANGE_NULLABILITY)(
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
