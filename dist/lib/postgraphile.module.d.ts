import { OnModuleInit, DynamicModule } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpRequestHandler } from 'postgraphile';
import { PGraphilelModuleOptions } from './interfaces/module-options.interface';
export declare class PostGraphileModule implements OnModuleInit {
    private readonly httpAdapterHost;
    private readonly options;
    postgraphile: HttpRequestHandler;
    constructor(httpAdapterHost: HttpAdapterHost, options: PGraphilelModuleOptions);
    static forRoot(options: PGraphilelModuleOptions): DynamicModule;
    onModuleInit(): void;
}
