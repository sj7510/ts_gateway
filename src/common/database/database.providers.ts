import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from '@/utils';
import * as path from 'path';

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mongodb';
const { MONGODB_CONFIG } = getConfig();

// Construct the MongoDB URL with authentication credentials
const mongoUrl =
  MONGODB_CONFIG.username && MONGODB_CONFIG.password
    ? `mongodb://${MONGODB_CONFIG.username}:${MONGODB_CONFIG.password}@${new URL(MONGODB_CONFIG.url).host}/${MONGODB_CONFIG.database}?authSource=admin`
    : MONGODB_CONFIG.url;

const MONGODB_DATABASE_CONFIG = {
  ...MONGODB_CONFIG,
  type: databaseType,
  url: mongoUrl,
  entities: [
    path.join(
      __dirname,
      `../../**/*.${MONGODB_CONFIG.entities}.entity{.ts,.js}`,
    ),
  ],
};
const MONGODB_DATA_SOURCE = new DataSource(MONGODB_DATABASE_CONFIG);

// 数据库注入
export const DatabaseProviders = [
  {
    provide: 'MONGODB_DATA_SOURCE',
    useFactory: async () => {
      try {
        await MONGODB_DATA_SOURCE.initialize();
        console.log('MongoDB connection initialized successfully');
        return MONGODB_DATA_SOURCE;
      } catch (error) {
        console.error('Failed to initialize MongoDB connection:', error);
        throw error;
      }
    },
  },
];
