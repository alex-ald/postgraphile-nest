import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  SCHEMA_PLUGINS_METADATA,
  PLUGIN_TYPE_METADATA,
} from '../postgraphile.constants';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginType } from '../enums/plugin-type.enum';
import { BaseExplorerService } from './base-explorer.service';
import {
  makeProcessSchemaPlugin,
  makeChangeNullabilityPlugin,
} from 'graphile-utils';


@Injectable()
export class PluginExplorerService extends BaseExplorerService {
  constructor(
    modulesContainer: ModulesContainer,
    metadataScanner: MetadataScanner,
  ) {
    super(modulesContainer, metadataScanner);
  }

  public getPlugins() {
    const modules = this.getModules();

    return this.evaluateModules(modules, instance =>
      this.filterAttachPlugins(instance),
    );
  }

  protected filterAttachPlugins(wrapper: InstanceWrapper) {
    const { instance } = wrapper;

    if (!instance) {
      return undefined;
    }

    const metadata = Reflect.getMetadata(
      SCHEMA_PLUGINS_METADATA,
      instance.constructor,
    );

    if (metadata) {
      const prototype = Object.getPrototypeOf(instance);
      const plugins = this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        methodName => this.extractPlugins(instance, prototype, methodName),
      );

      return plugins;
    }

    return undefined;
  }

  protected extractPlugins(instance: any, prototype: any, methodName: string) {
    const callback = prototype[methodName];

    // tslint:disable-next-line: ban-types
    const method = (instance[methodName] as Function).bind(instance);

    const metadata = Reflect.getMetadata(
      PLUGIN_TYPE_METADATA,
      callback,
    ) as PluginType;

    switch (metadata) {
      // case PluginType.ADD_INFLECTORS:
      //   // const { inflector, overriteExisting } = Reflect.getMetadata(
      //   //   PLUGIN_DETAILS_METADATA,
      //   //   callback,
      //   // );
      //   // return makeAddInflectorsPlugin(
      //   //   { [inflector]: method },
      //   //   overriteExisting,
      //   // );
      //   return undefined;
      // case PluginType.CHANGE_NULLABILITY:
      //   return makeChangeNullabilityPlugin(method());
      // case PluginType.EXTEND_SCHEMA:
      //   // return makeExtendSchemaPlugin(method);
      //   return undefined;
      // case PluginType.PROCESS_SCHEMA:
      //   return makeProcessSchemaPlugin(method);
      // case PluginType.WRAP_RESOLVER:
      // TODO: HANDLE ADDING PLUGIN
      default:
        return undefined;
    }

    if (metadata) {
      return instance[methodName].call(instance);
    }

    return undefined;
  }
}
