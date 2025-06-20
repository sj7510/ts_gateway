import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { systemProviders } from './system.providers';
import { DatabaseModule } from '@/common/database/database.module';

@Module({
  providers: [SystemService, ...systemProviders],
  imports: [DatabaseModule],
  exports: [SystemService],
  controllers: [SystemController],
})
export class SystemModule {}
