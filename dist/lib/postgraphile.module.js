"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PostGraphileModule_1;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const postgraphile_1 = require("postgraphile");
const postgraphile_constants_1 = require("./postgraphile.constants");
const graphql_playground_middleware_express_1 = require("graphql-playground-middleware-express");
let PostGraphileModule = PostGraphileModule_1 = class PostGraphileModule {
    constructor(httpAdapterHost, options) {
        this.httpAdapterHost = httpAdapterHost;
        this.options = options;
    }
    static forRoot(options) {
        return {
            module: PostGraphileModule_1,
            providers: [
                {
                    provide: postgraphile_constants_1.POSTGRAPHILE_MODULE_OPTIONS,
                    useValue: options,
                },
            ],
        };
    }
    static forRootAsync(options) {
        return {
            module: PostGraphileModule_1,
            imports: options.imports,
            providers: [
                ...this.createAsyncProviders(options),
            ],
        };
    }
    static createAsyncProviders(options) {
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
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: postgraphile_constants_1.POSTGRAPHILE_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: postgraphile_constants_1.POSTGRAPHILE_MODULE_OPTIONS,
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createPGraphileOptions(); }),
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
        const _a = this.options, { pgConfig, schema, playground } = _a, postGraphileOptions = __rest(_a, ["pgConfig", "schema", "playground"]);
        if (schema) {
            this.postgraphile = postgraphile_1.postgraphql(pgConfig, schema, postGraphileOptions);
        }
        else {
            this.postgraphile = postgraphile_1.postgraphql(pgConfig, postGraphileOptions);
        }
        app.use(this.postgraphile);
        if (playground) {
            app.get('/playground', graphql_playground_middleware_express_1.default({ endpoint: '/graphql' }));
        }
    }
};
PostGraphileModule = PostGraphileModule_1 = __decorate([
    common_1.Module({}),
    __param(1, common_1.Inject(postgraphile_constants_1.POSTGRAPHILE_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost, Object])
], PostGraphileModule);
exports.PostGraphileModule = PostGraphileModule;
//# sourceMappingURL=postgraphile.module.js.map