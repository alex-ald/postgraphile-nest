import { Module, OnModuleInit, Inject, DynamicModule } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { postgraphql, HttpRequestHandler } from 'postgraphile';
import { POSTGRAPHILE_MODULE_OPTIONS } from './postgraphile.constants';
import { PGraphilelModuleOptions } from './interfaces/module-options.interface';
import expressPlayground from 'graphql-playground-middleware-express';

@Module({})
export class PostGraphileModule implements OnModuleInit {

  postgraphile: HttpRequestHandler;

  constructor(
      private readonly httpAdapterHost: HttpAdapterHost,
      @Inject(POSTGRAPHILE_MODULE_OPTIONS) private readonly options: PGraphilelModuleOptions,
  ) {

  }

  static forRoot(options: PGraphilelModuleOptions): DynamicModule {
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
