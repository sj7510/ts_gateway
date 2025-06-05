import { Resource } from './resource.mysql.entity';

export const ResourceProviders = [
  {
    provide: 'RESOURCE_REPOSITORY',
    useFactory: (AppDataSource: any) => AppDataSource.getRepository(Resource),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];
