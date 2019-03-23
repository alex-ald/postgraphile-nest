import { OnModuleInit, DynamicModule } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpRequestHandler } from 'postgraphile';
import { PGraphilelModuleAsyncOptions, PGraphileModuleOptions } from './interfaces/module-options.interface';
export declare class PostGraphileModule implements OnModuleInit {
    private readonly httpAdapterHost;
    private readonly options;
    postgraphile: HttpRequestHandler;
    constructor(httpAdapterHost: HttpAdapterHost, options: PGraphileModuleOptions);
    static forRoot(options: PGraphileModuleOptions): DynamicModule;
    static forRootAsync(options: PGraphilelModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    onModuleInit(): void;
}
