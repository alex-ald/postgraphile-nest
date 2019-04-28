import { PluginFactory } from './../factories/plugin.factory';
import { ModulesContainer } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { BaseExplorerService } from './base-explorer.service';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  SCHEMA_TYPE_METADATA,
  SCHEMA_TYPE_PLUGIN_METADATA,
  PLUGIN_DETAILS_METADATA,
} from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { makePluginByCombiningPlugins } from 'graphile-utils';
import { Injectable } from '@nestjs/common';
import { Plugin } from 'postgraphile';
import { ExtendSchemaOptions } from '../interfaces/extend-schema-options.interface';

@Injectable()
export class SchemaTypeExplorerService extends BaseExplorerService {
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
   * Goes through all of the methods on the instance and returns a list of plugins from methods with plugin metadata
   */
  protected filterAttachPlugins(wrapper: InstanceWrapper): Plugin[] {
    const { instance } = wrapper;

    if (!instance) {
      return undefined;
    }

    const metadata = Reflect.getMetadata(
      SCHEMA_TYPE_METADATA,
      instance.constructor,
    );

    if (metadata) {
      const { typeName } = metadata;
      const prototype = Object.getPrototypeOf(instance);
      const plugins = this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        methodName =>
          this.extractTypePlugins(instance, prototype, methodName, typeName),
      );

      return plugins;
    }

    return undefined;
  }

  /**
   * Based on the object and methodName passed, a plugin is will be created from the metadata set
   * If no metadata is set on the method, then undefined is returned
   */
  protected extractTypePlugins(
    instance: any,
    prototype: any,
    methodName: string,
    typeName: string,
  ) {
    const callback = prototype[methodName];

    const metadata = Reflect.getMetadata(
      SCHEMA_TYPE_PLUGIN_METADATA,
      callback,
    ) as PluginType;

    const pluginDetails = Reflect.getMetadata(
      PLUGIN_DETAILS_METADATA,
      callback,
    );

    if (metadata === PluginType.CHANGE_NULLABILITY) {
      const { fieldName } = pluginDetails;

      return PluginFactory.createChangeNullabilityPlugin(
        typeName,
        fieldName,
        instance[methodName](),
      );
    } else if (metadata === PluginType.WRAP_RESOLVER) {
      const { fieldName, ...requirements } = pluginDetails;

      return PluginFactory.createWrapResolverPlugin(
        typeName,
        fieldName,
        requirements,
        // tslint:disable-next-line:ban-types
        (instance[methodName] as Function).bind(instance),
      );
    } else if (metadata === PluginType.EXTEND_SCHEMA) {
      const {
        additionalGraphql,
        fieldName,
        fieldType,
        typeName: actualTypeName,
      } = pluginDetails as ExtendSchemaOptions;

      return PluginFactory.createExtendSchemaPlugin(
        actualTypeName || typeName,
        fieldName,
        fieldType,
        // tslint:disable-next-line:ban-types
        (instance[methodName] as Function).bind(instance),
        additionalGraphql,
      );
    }

    return undefined;
  }
}
