import { SetMetadata } from '@nestjs/common';
import { PLUGIN_TYPE_METADATA, PLUGIN_DETAILS_METADATA } from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { AddInflectorOptions } from '../interfaces/add-inflector-options.interface';

export function AddInflector(options: AddInflectorOptions) {
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

    SetMetadata(PLUGIN_DETAILS_METADATA, options)(
      target,
      key,
      descriptor,
    );
  };
}
