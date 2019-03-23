import { PoolConfig } from 'pg';
import { PostGraphileOptions } from 'postgraphile';
import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface PGraphileModuleOptions extends PostGraphileOptions {
    pgConfig: PoolConfig | string;
    schema?: string | string[];
    playground?: boolean;
}

export interface PGraphileOptionsFactory {
  createPGraphileOptions(): Promise<PGraphileModuleOptions> | PGraphileModuleOptions;
}

export interface PGraphilelModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'>  {
  useExisting?: Type<PGraphileOptionsFactory>;
  useClass?: Type<PGraphileOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<PGraphileModuleOptions> | PGraphileModuleOptions;
  inject?: any[];
}
