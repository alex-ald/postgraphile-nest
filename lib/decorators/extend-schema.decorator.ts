import { SetMetadata } from '@nestjs/common';
import {
  SCHEMA_TYPE_PLUGIN_METADATA,
  PLUGIN_DETAILS_METADATA,
  PLUGIN_TYPE_METADATA,
} from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { ExtendSchemaOptions } from '../interfaces/extend-schema-options.interface';

export function ExtendSchema(
  options: ExtendSchemaOptions,
) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    propertyKey?: string,
    descriptor?: any,
  ) => {
    if (options.typeName) {
      SetMetadata(PLUGIN_TYPE_METADATA, PluginType.EXTEND_SCHEMA)(
        target,
        propertyKey,
        descriptor,
      );
    } else {
      SetMetadata(SCHEMA_TYPE_PLUGIN_METADATA, PluginType.EXTEND_SCHEMA)(
        target,
        propertyKey,
        descriptor,
      );
    }

    SetMetadata(PLUGIN_DETAILS_METADATA, options)(target, propertyKey, descriptor);
  };
}
