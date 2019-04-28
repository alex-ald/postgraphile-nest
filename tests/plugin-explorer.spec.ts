import { Test, TestingModule } from '@nestjs/testing';
import { SchemaType, ChangeNullability, WrapResolver } from '../lib';
import * as sinon from 'sinon';
import { PluginType } from '../lib/enums/plugin-type.enum';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginExplorerService } from '../lib/services/plugin-explorer.service';
import { Injectable } from '@nestjs/common';
import { AddInflector } from '../lib/decorators/add-inflector-plugin.decorator';
import { ProcessSchema } from '../lib/decorators/process-schema-plugin.decorator';
import { WrapResolverFilter } from '../lib/decorators/wrap-resolver-filter.decorator';

@Injectable()
class TestPlugin {

  @AddInflector({ inflector: 'patchType' })
  public patchTypeInflector(typeName: string) {
    return `${typeName}-change-set`.toUpperCase();
  }

  @ProcessSchema()
  public nameResolver(schema: any) {
    return 'test';
  }

  @WrapResolverFilter()
  public resolverFilter() {
    return 'test';
  }
}

describe('SchemaTypeExplorerService', () => {
  let pluginExplorerService: PluginExplorerService;
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [MetadataScanner, PluginExplorerService, TestPlugin],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    pluginExplorerService = app.get(PluginExplorerService);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create all plugins', done => {
    let count = 0;
    sinon.replace(pluginExplorerService as any, 'createPlugin',
      (
        pluginType: PluginType,
        instance: any,
        prototype: any,
        methodName: string,
      ) => {
        count++;

        if (count === 1) {
          expect(methodName).toBe('patchTypeInflector');
          expect(pluginType).toBe(PluginType.ADD_INFLECTORS);
        } else if (count === 2) {
          expect(methodName).toBe('nameResolver');
          expect(pluginType).toBe(PluginType.PROCESS_SCHEMA);
        } else if (count === 3) {
          expect(methodName).toBe('resolverFilter');
          expect(pluginType).toBe(PluginType.WRAP_RESOLVER);

          done();
        }
    });

    pluginExplorerService.getCombinedPlugin();
  });
});
