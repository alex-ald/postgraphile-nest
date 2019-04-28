import { Test, TestingModule } from '@nestjs/testing';
import { SchemaTypeExplorerService } from '../lib/services/schema-type-explorer.service';
import { SchemaType, ChangeNullability, WrapResolver } from '../lib';
import * as sinon from 'sinon';
import { PluginType } from '../lib/enums/plugin-type.enum';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ExtendSchema } from '../lib/decorators/extend-schema.decorator';

@SchemaType('User')
class TestPlugin {

  @ChangeNullability({ fieldName: 'name' })
  public nameNullability() {
    return true;
  }

  @WrapResolver({ fieldName: 'name' })
  public nameResolver() {
    return 'test';
  }

  @ExtendSchema({ fieldName: 'name2', fieldType: 'String' })
  public addName2Field() {
    return 'test2';
  }
}

describe('SchemaTypeExplorerService', () => {
  let schemaTypeExplorerService: SchemaTypeExplorerService;
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [MetadataScanner, SchemaTypeExplorerService, TestPlugin],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    schemaTypeExplorerService = app.get(SchemaTypeExplorerService);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create all plugins', done => {
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
});
