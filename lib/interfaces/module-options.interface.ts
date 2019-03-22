import { PoolConfig } from 'pg';
import { PostGraphileOptions } from 'postgraphile';

export interface PGraphilelModuleOptions extends PostGraphileOptions {
    pgConfig: PoolConfig | string;
    schema?: string | string[];
    playground?: boolean;
}
