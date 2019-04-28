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
  makePluginByCombiningPlugins,
} from 'graphile-utils';
import { Plugin } from 'postgraphile';

/**
 * Explorer service handles creating plugins from all plugin metadata set in providers (Excluding
 *  SchemaType providers, as there is a separate explorer service that handles them)
 */
@Injectable()
export class PluginExplorerService extends BaseExplorerService {
  constructor(
    modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {
    super(modulesContainer);
  }

  /**
   * Returns a plugin combining all the plugins found from all module's providers
   */
  public getCombinedPlugin() {
    const modules = this.getModules();

    const plugins: Plugin[] = this.evaluateModules(modules, instance =>
      this.filterAttachPlugins(instance),
    );

    return makePluginByCombiningPlugins(...plugins);
  }

  /**
   * Returns a list of all the plugins created from all provider's method metadata set by the decorators
   */
  protected filterAttachPlugins(wrapper: InstanceWrapper) {
    const { instance } = wrapper;

    if (!instance) {
      return undefined;
    }

    const prototype = Object.getPrototypeOf(instance);
    const plugins = this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      methodName => this.extractPlugin(instance, prototype, methodName),
    );

    return plugins;
  }

  /**
   * Extracts the plugin based on the metadata set on the method
   */
  protected extractPlugin(instance: any, prototype: any, methodName: string) {
    const callback = prototype[methodName];

    const pluginType = Reflect.getMetadata(
      PLUGIN_TYPE_METADATA,
      callback,
    ) as PluginType;

    return this.createPlugin(pluginType, instance, prototype, methodName);
  }

  createPlugin(pluginType: PluginType, instance: any, prototype: any, methodName: string) {
    const callback = prototype[methodName];

    // tslint:disable-next-line: ban-types
    const method = (instance[methodName] as Function).bind(instance);

    switch (pluginType) {
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
          additionalGraphql,
          fieldName,
          fieldType,
          typeName,
        } = Reflect.getMetadata(
          PLUGIN_DETAILS_METADATA,
          callback,
        ) as ExtendSchemaOptions;

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
