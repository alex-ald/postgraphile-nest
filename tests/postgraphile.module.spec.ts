import { TestingModule, Test } from '@nestjs/testing';
import * as sinon from 'sinon';
import { PluginFactory } from '../lib/factories/plugin.factory';
import { PostGraphileOptions } from 'postgraphile';
import { Test2Plugin } from './helpers/test2-plugin';
import { TestPlugin } from './helpers/test-plugin';
import { SchemaTypeExplorerService } from '../lib/services/schema-type-explorer.service';
import { PostGraphileModule } from '../lib/postgraphile.module';

describe('PostGraphileModule', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should add created plugins to options for PostGraphile server', async () => {
    sinon.replace(PostGraphileModule.prototype as any, 'createPostGraphql', (
      config: any,
      schema?: any,
      options?: PostGraphileOptions,
    ): any => {
      expect(options.appendPlugins.length).toBe(3);

      return () => {/* requries a function to be returned */};
    });

    const createExtendSchemaSpy = sinon.spy(PluginFactory, 'createExtendSchemaPlugin');
    const createWrapResolverSpy = sinon.spy(PluginFactory, 'createWrapResolverPlugin');
    const createChangeNullabilitySpy = sinon.spy(PluginFactory, 'createChangeNullabilityPlugin');
    const createProcessSchemaSpy = sinon.spy(PluginFactory, 'createProcessSchemaPlugin');
    const createAddInflectorsSpy = sinon.spy(PluginFactory, 'createAddInflectorsPlugin');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PostGraphileModule.forRoot({ pgConfig: '', appendPlugins: [{ test: 'test' } as any ] })],
      providers: [TestPlugin, Test2Plugin],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    expect(createExtendSchemaSpy.callCount).toBe(2);
    expect(createWrapResolverSpy.callCount).toBe(1);
    expect(createChangeNullabilitySpy.callCount).toBe(1);
    expect(createProcessSchemaSpy.callCount).toBe(1);
    expect(createAddInflectorsSpy.callCount).toBe(1);
  });

  it('playground and graphql route should not be allowed to be the same', async () => {
    sinon.stub(PostGraphileModule.prototype as any, 'createPostGraphql').returns(() => {/* */});
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PostGraphileModule.forRoot({ pgConfig: '', playground: true, playgroundRoute: '/graphql' })],
    }).compile();

    const app = moduleFixture.createNestApplication();

    expect.assertions(1);
    await expect(app.init()).rejects.toBeTruthy();
  });
});
