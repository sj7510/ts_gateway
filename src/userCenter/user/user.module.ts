import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserProviders } from './user.providers';

import { DatabaseModule } from '@/common/database/database.module';
import { RolePrivilegeModule } from '../role-privilege/role-privilege.module';
import { UserRoleModule } from '../user-role/user-role.module';
import { RoleModule } from '../role/role.module';
import { FeishuService } from './feishu/feishu.service';
import { PrivilegeModule } from '@/userCenter/privilege/prvilege.module';

@Module({
  controllers: [UserController],
  providers: [...UserProviders, UserService, FeishuService],
  imports: [
    forwardRef(() => DatabaseModule),
    RolePrivilegeModule,
    UserRoleModule,
    RoleModule,
    PrivilegeModule,
  ],
  exports: [UserService, FeishuService],
})
export class UserModule {}
