import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/common/database/database.module';

import { ResourceModule } from '../resource/resource.module';
import { PrivilegeController } from './privilege.controller';
import { PrivilegeProviders } from './privilege.providers';
import { PrivilegeService } from './privilege.service';
import { SystemModule } from '@/userCenter/system/system.module';

@Module({
  controllers: [PrivilegeController],
  providers: [PrivilegeService, ...PrivilegeProviders],
  imports: [DatabaseModule, SystemModule, ResourceModule],
  exports: [PrivilegeService],
})
export class PrivilegeModule {}
