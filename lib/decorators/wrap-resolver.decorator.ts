import { SetMetadata } from '@nestjs/common';
import {
  SCHEMA_TYPE_PLUGIN_METADATA,
  SCHEMA_TYPE_PLUGIN_DETAILS_METADATA,
} from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { ResolverWrapperRequirements } from '../interfaces/wrap-resolver-requirements.interface';

export function WrapResolver(fieldName: string);
export function WrapResolver(
  fieldName: string,
  requirements?: ResolverWrapperRequirements,
) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    propertyKey?: string,
    descriptor?: any,
  ) => {
    fieldName = fieldName || propertyKey;

    SetMetadata(SCHEMA_TYPE_PLUGIN_METADATA, PluginType.WRAP_RESOLVER)(
      target,
      propertyKey,
      descriptor,
    );

    SetMetadata(SCHEMA_TYPE_PLUGIN_DETAILS_METADATA, { fieldName, requirements })(
      target,
      propertyKey,
      descriptor,
    );
  };
}
