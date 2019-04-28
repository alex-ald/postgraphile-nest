import { SetMetadata } from '@nestjs/common';
import { SCHEMA_TYPE_PLUGIN_METADATA, PLUGIN_DETAILS_METADATA } from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';

export function ChangeNullability();
export function ChangeNullability(fieldName?: string) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    propertyKey?: string,
    descriptor?: any,
  ) => {
    fieldName = fieldName || propertyKey;
    SetMetadata(SCHEMA_TYPE_PLUGIN_METADATA, PluginType.CHANGE_NULLABILITY)(
      target,
      propertyKey,
      descriptor,
    );

    SetMetadata(PLUGIN_DETAILS_METADATA, { fieldName })(
      target,
      propertyKey,
      descriptor,
    );
  };
}
