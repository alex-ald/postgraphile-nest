import { Test, TestingModule } from '@nestjs/testing';
import { SchemaTypeExplorerService } from '../lib/services/schema-type-explorer.service';
import * as sinon from 'sinon';
import { PluginType } from '../lib/enums/plugin-type.enum';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { PluginFactory } from '../lib/factories/plugin.factory';
import { Test2Plugin } from './helpers/test2-plugin';

describe('SchemaTypeExplorerService', () => {
  let schemaTypeExplorerService: SchemaTypeExplorerService;
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [MetadataScanner, SchemaTypeExplorerService, Test2Plugin],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    schemaTypeExplorerService = app.get(SchemaTypeExplorerService);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('decorators should set correct metadata', done => {
    let count = 0;
    sinon.replace(schemaTypeExplorerService as any, 'createPlugin',
      (
        instance: any,
        methodName: string,
        pluginType: PluginType,
        pluginDetails: any,
        typeName: string,
      ) => {
        count++;

        if (count === 1) {
          expect(methodName).toBe('nameNullability');
          expect(pluginType).toBe(PluginType.CHANGE_NULLABILITY);
        } else if (count === 2) {
          expect(methodName).toBe('nameResolver');
          expect(pluginType).toBe(PluginType.WRAP_RESOLVER);
        } else if (count === 3) {
          expect(methodName).toBe('addName2Field');
          expect(pluginType).toBe(PluginType.EXTEND_SCHEMA);

          done();
        }
    });

    schemaTypeExplorerService.getCombinedPlugin();
  });

  it('should create all the correct plugins', () => {
    const createExtendSchemaSpy = sinon.spy(PluginFactory, 'createExtendSchemaPlugin');
    const createWrapResolverSpy = sinon.spy(PluginFactory, 'createWrapResolverPlugin');
    const createChangeNullabilitySpy = sinon.spy(PluginFactory, 'createChangeNullabilityPlugin');

    schemaTypeExplorerService.getCombinedPlugin();

    expect(createExtendSchemaSpy.callCount).toBe(1);
    expect(createWrapResolverSpy.callCount).toBe(1);
    expect(createChangeNullabilitySpy.callCount).toBe(1);
  });
});
