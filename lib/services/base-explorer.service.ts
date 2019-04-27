import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { flattenDeep, identity } from 'lodash';
import {
  SCHEMA_PLUGINS_METADATA,
  PLUGIN_TYPE_METADATA,
  PLUGIN_DETAILS_METADATA,
} from '../postgraphile.constants';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginType } from '../enums/plugin-type.enum';
import {
  makeAddInflectorsPlugin,
  makeProcessSchemaPlugin,
  makeChangeNullabilityPlugin,
} from 'graphile-utils';


export abstract class BaseExplorerService {
  constructor(
    protected readonly modulesContainer: ModulesContainer,
    protected readonly metadataScanner: MetadataScanner,
  ) {}

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
