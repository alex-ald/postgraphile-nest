import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { PluginType } from '../lib/enums/plugin-type.enum';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginExplorerService } from '../lib/services/plugin-explorer.service';
import { PluginFactory } from '../lib/factories/plugin.factory';
import { TestPlugin } from './helpers/test-plugin';

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

  it('decorators should set correct metadata', done => {
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
          expect(methodName).toBe('nameExtendSchema');
          expect(pluginType).toBe(PluginType.EXTEND_SCHEMA);

          done();
        }
    });

    pluginExplorerService.getCombinedPlugin();
  });

  it('should create all the correct plugins', () => {
    const createExtendSchemaSpy = sinon.spy(PluginFactory, 'createExtendSchemaPlugin');
    const createProcessSchemaSpy = sinon.spy(PluginFactory, 'createProcessSchemaPlugin');
    const createAddInflectorsSpy = sinon.spy(PluginFactory, 'createAddInflectorsPlugin');

    pluginExplorerService.getCombinedPlugin();

    expect(createExtendSchemaSpy.callCount).toBe(1);
    expect(createProcessSchemaSpy.callCount).toBe(1);
    expect(createAddInflectorsSpy.callCount).toBe(1);
  });
});
