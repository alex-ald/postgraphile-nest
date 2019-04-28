import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  PLUGIN_TYPE_METADATA,
  PLUGIN_DETAILS_METADATA,
} from '../postgraphile.constants';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginType } from '../enums/plugin-type.enum';
import { BaseExplorerService } from './base-explorer.service';
import { ExtendSchemaOptions } from '../interfaces/extend-schema-options.interface';
import { PluginFactory } from '../factories/plugin.factory';
import {
  makeProcessSchemaPlugin,
  makeAddInflectorsPlugin,
  makeWrapResolversPlugin,
} from 'graphile-utils';


@Injectable()
export class PluginExplorerService extends BaseExplorerService {
  constructor(
    modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {
    super(modulesContainer);
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

    const prototype = Object.getPrototypeOf(instance);
    const plugins = this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      methodName => this.extractPlugins(instance, prototype, methodName),
    );

    return plugins;
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
      case PluginType.ADD_INFLECTORS:
        const { inflector, overriteExisting } = Reflect.getMetadata(
          PLUGIN_DETAILS_METADATA,
          callback,
        );
        return makeAddInflectorsPlugin(
          { [inflector]: method },
          overriteExisting,
        );
      case PluginType.PROCESS_SCHEMA:
        return makeProcessSchemaPlugin(method);
      case PluginType.WRAP_RESOLVER:
        return makeWrapResolversPlugin(method);
      case PluginType.WRAP_RESOLVER:
        const {
          additionalGraphql, fieldName, fieldType, typeName,
        } = Reflect.getMetadata(PLUGIN_DETAILS_METADATA, callback) as ExtendSchemaOptions;

        return PluginFactory.createExtendSchemaPlugin(
          typeName,
          fieldName,
          fieldType,
          // tslint:disable-next-line:ban-types
          (instance[methodName] as Function).bind(instance),
          additionalGraphql,
        );
      default:
        return undefined;
    }
  }
}
