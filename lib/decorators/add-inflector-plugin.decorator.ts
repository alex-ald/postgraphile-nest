import { SetMetadata } from '@nestjs/common';
import { PLUGIN_TYPE_METADATA, PLUGIN_DETAILS_METADATA } from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';

export function AddInflector(inflector: string);
export function AddInflector(inflector: string, overriteExisting?: boolean) {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    key?: string | symbol,
    descriptor?: any,
  ) => {
    SetMetadata(PLUGIN_TYPE_METADATA, PluginType.ADD_INFLECTORS)(
      target,
      key,
      descriptor,
    );

    SetMetadata(PLUGIN_DETAILS_METADATA, { inflector, overriteExisting })(
      target,
      key,
      descriptor,
    );
  };
}
