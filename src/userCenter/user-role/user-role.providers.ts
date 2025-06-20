import { UserRole } from './user-role.mysql.entity';

export const UserRoleProviders = [
  {
    provide: 'USER_ROLE_REPOSITORY',
    useFactory: (AppDataSource: any) => AppDataSource.getRepository(UserRole),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];
