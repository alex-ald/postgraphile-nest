import { Module, OnModuleInit, Inject, DynamicModule, Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { postgraphql, HttpRequestHandler } from 'postgraphile';
import { POSTGRAPHILE_MODULE_OPTIONS } from './postgraphile.constants';
import { PGraphilelModuleAsyncOptions, PGraphileModuleOptions, PGraphileOptionsFactory } from './interfaces/module-options.interface';
import expressPlayground from 'graphql-playground-middleware-express';
import { PluginExplorerService } from './services/plugin-explorer.service';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { SchemaTypeExplorerService } from './services/schema-type-explorer.service';

@Module({
  providers: [MetadataScanner, PluginExplorerService, SchemaTypeExplorerService],
})
export class PostGraphileModule implements OnModuleInit {

  private static readonly instances: PostGraphileModule[] = [];
  postgraphile: HttpRequestHandler;

  constructor(
      private readonly httpAdapterHost: HttpAdapterHost,
      private readonly pluginExplorerService: PluginExplorerService,
      private readonly schemaTypeExplorerService: SchemaTypeExplorerService,
      @Inject(POSTGRAPHILE_MODULE_OPTIONS) private readonly options: PGraphileModuleOptions,
  ) {
    PostGraphileModule.instances.push(this);
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

  static get Postgraphile(): HttpRequestHandler | undefined {
    return PostGraphileModule.instances[0]?.postgraphile;
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
    const {pgConfig, schema, playground, useAsMiddleware = true, ...postGraphileOptions} = this.options;

    const { appendPlugins = [] } = postGraphileOptions;

    // Retrieve all plugins created by decorators
    const accumulatedSchemaTypePlugin = this.schemaTypeExplorerService.getCombinedPlugin();
    const accumulatedPlugin = this.pluginExplorerService.getCombinedPlugin();

    const updatedPostGraphileOptions = {
      ...postGraphileOptions,
      appendPlugins: [accumulatedSchemaTypePlugin, accumulatedPlugin, ...appendPlugins],
    };

    this.postgraphile = this.createPostGraphql(pgConfig, schema, updatedPostGraphileOptions);

    if (useAsMiddleware) {
      app.use(this.postgraphile);
    }

    const graphqlRoute = this.options.graphqlRoute ||  '/graphql';
    const playgroundRoute = this.options.playgroundRoute || '/playground';

    if (playground) {
      if (playgroundRoute === graphqlRoute) {
        throw new Error(
          `Cannot use the same route, '${graphqlRoute}', for both GraphQL and the Playground. Please use different routes.`,
        );
      }

      app.get(playgroundRoute, expressPlayground({ endpoint: graphqlRoute }));
    }
  }

  /**
   * Creates PostGraphile server
   */
  private createPostGraphql(pgConfig, schema, options) {
    if (schema) {
      return  postgraphql(pgConfig, schema, options);
    } else {
      return postgraphql(pgConfig, options);
    }
  }
}
