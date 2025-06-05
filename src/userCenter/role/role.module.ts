import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { DatabaseModule } from '@/common/database/database.module';
import { SystemModule } from '../system/system.module';
import { PrivilegeModule } from '@/userCenter/privilege/prvilege.module';
import { RolePrivilegeModule } from '@/userCenter/role-privilege/role-privilege.module';
import { RoleProviders } from '@/userCenter/role/role.providers';

@Module({
  imports: [DatabaseModule, RolePrivilegeModule, PrivilegeModule, SystemModule],
  providers: [RoleService, ...RoleProviders],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
