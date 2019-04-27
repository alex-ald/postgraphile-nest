import { ModulesContainer } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { BaseExplorerService } from './base-explorer.service';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { SCHEMA_TYPE_METADATA, SCHEMA_TYPE_PLUGIN_METADATA, SCHEMA_TYPE_PLUGIN_DETAILS_METADATA } from '../postgraphile.constants';
import { PluginType } from '../enums/plugin-type.enum';
import { makeChangeNullabilityPlugin } from 'graphile-utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SchemaTypeExplorerService extends  BaseExplorerService {
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
      SCHEMA_TYPE_METADATA,
      instance.constructor,
    );

    if (metadata) {
      const { typeName } = metadata;
      const prototype = Object.getPrototypeOf(instance);
      const plugins = this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        methodName => this.extractTypePlugins(instance, prototype, methodName, typeName),
      );

      return plugins;
    }

    return undefined;
  }

  protected extractTypePlugins(instance: any, prototype: any, propertyName: string, typeName: string) {
    const callback = prototype[propertyName];

    // tslint:disable-next-line: ban-types
    // const method = (instance[methodName] as Function).bind(instance);

    const metadata = Reflect.getMetadata(
      SCHEMA_TYPE_PLUGIN_METADATA,
      callback,
    ) as PluginType;

    const pluginDetails = Reflect.getMetadata(SCHEMA_TYPE_PLUGIN_DETAILS_METADATA, callback);

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
      case PluginType.CHANGE_NULLABILITY:
        const { fieldName } = pluginDetails;

        return makeChangeNullabilityPlugin({
          [typeName]: {
            [fieldName]: instance[propertyName](),
          },
        });
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
  }
}
