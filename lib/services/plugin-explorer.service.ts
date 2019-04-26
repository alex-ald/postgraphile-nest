import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { flattenDeep, identity } from 'lodash';
import { SCHEMA_PLUGINS_METADATA, PLUGIN_TYPE_METADATA, PLUGIN_DETAILS_METADATA } from '../postgraphile.constants';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginType } from '../enums/plugin-type.enum';
import { makeAddInflectorsPlugin, makeProcessSchemaPlugin } from 'graphile-utils';

@Injectable()
export class PluginExplorerService {

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  public getPlugins() {
    const modules = this.getModules();

    return this.evaluateModules(
      modules,
      instance => this.filterAttachPlugins(instance),
    );
  }

  protected filterAttachPlugins(wrapper: InstanceWrapper) {
    const { instance } = wrapper;

    if (!instance) {
      return undefined;
    }

    const metadata = Reflect.getMetadata(SCHEMA_PLUGINS_METADATA, instance.constructor);

    if (metadata) {
      const prototype = Object.getPrototypeOf(instance);
      const plugins = this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        (methodName) => this.extractPlugins(instance, prototype, methodName),
      );

      return plugins;
    }

    return undefined;
  }

  protected extractPlugins(instance: any, prototype: any, methodName: string) {
    const callback = prototype[methodName];

    const metadata = Reflect.getMetadata(PLUGIN_TYPE_METADATA, callback) as PluginType;
    // tslint:disable-next-line: ban-types
    const method = (instance[methodName] as Function).bind(instance);
    switch (metadata) {
      case PluginType.ADD_INFLECTORS:
        const { inflector, overriteExisting } = Reflect.getMetadata(PLUGIN_DETAILS_METADATA, callback);
        return makeAddInflectorsPlugin({ [inflector]: method }, overriteExisting);
      case PluginType.CHANGE_NULLABILITY:
        // TODO: HANDLE ADDING PLUGIN
      case PluginType.EXTEND_SCHEMA:
        // TODO: HANDLE ADDING PLUGIN
      case PluginType.PROCESS_SCHEMA:
        return makeProcessSchemaPlugin(method);
      case PluginType.WRAP_RESOLVER:
        // TODO: HANDLE ADDING PLUGIN
      default:
        return undefined;
    }

    if (metadata) {
      return instance[methodName].call(instance);
    }

    return undefined;
  }

  protected evaluateModules(
    modules: Module[],
    mapModule: (instance: InstanceWrapper, moduleRef: Module) => any,
  ) {
    const invokeMap = () =>
      modules.map(module =>
        [...module.providers.values()].map(wrapper =>
          mapModule(wrapper, module),
        ),
      );
    return flattenDeep(invokeMap()).filter(identity);
  }

  protected getModules() {
    return [...this.modulesContainer.values()];
  }
}
