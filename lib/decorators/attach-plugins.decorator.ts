import { SetMetadata } from '@nestjs/common';
import { ATTACH_PLUGIN_METADATA } from '../postgraphile.constants';

export function AttachPlugin() {
  return (
    // tslint:disable-next-line:ban-types
    target: object | Function,
    key?: string | symbol,
    descriptor?: any,
  ) => {
    SetMetadata(ATTACH_PLUGIN_METADATA, true)(
      target,
      key,
      descriptor,
    );
  };
}
