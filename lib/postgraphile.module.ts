import { Module, OnModuleInit, Inject, DynamicModule, Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { postgraphql, HttpRequestHandler } from 'postgraphile';
import { POSTGRAPHILE_MODULE_OPTIONS } from './postgraphile.constants';
import { PGraphilelModuleAsyncOptions, PGraphileModuleOptions, PGraphileOptionsFactory } from './interfaces/module-options.interface';
import expressPlayground from 'graphql-playground-middleware-express';

@Module({})
export class PostGraphileModule implements OnModuleInit {

  postgraphile: HttpRequestHandler;

  constructor(
      private readonly httpAdapterHost: HttpAdapterHost,
      @Inject(POSTGRAPHILE_MODULE_OPTIONS) private readonly options: PGraphileModuleOptions,
  ) {

  }

  static forRoot(options: PGraphileModuleOptions): DynamicModule {
    return {
      module: PostGraphileModule,
      providers: [
        {
          provide: POSTGRAPHILE_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: PGraphilelModuleAsyncOptions): DynamicModule {
    return {
      module: PostGraphileModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
      ],
    };
  }

  private static createAsyncProviders(
    options: PGraphilelModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: PGraphilelModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: POSTGRAPHILE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: POSTGRAPHILE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: PGraphileOptionsFactory) =>
        await optionsFactory.createPGraphileOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  onModuleInit() {
    if (!this.httpAdapterHost) {
    return;
    }
    const httpAdapter = this.httpAdapterHost.httpAdapter;

    if (!httpAdapter) {
    return;
    }

    const app = httpAdapter.getInstance();

    // Break out PostGraphile options
    const {pgConfig, schema, playground, ...postGraphileOptions} = this.options;

    if (schema) {
      this.postgraphile = postgraphql(pgConfig, schema, postGraphileOptions);
    } else {
      this.postgraphile = postgraphql(pgConfig, postGraphileOptions);
    }

    app.use(this.postgraphile);

    if (playground) {
      app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
    }
  }
}
