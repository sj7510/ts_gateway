import { Controller, Post, Body } from '@nestjs/common';
import { PageConfigService } from './page-config.service';
import {
  CreatePageConfigDto,
  SearchPageConfigDto,
} from './dto/create-page-config.dto';
import { PageService } from '../page.service';
import { ApiTags } from '@nestjs/swagger';
import { PayloadUser } from '@/helper';

@ApiTags('页面属内容配置')
@Controller('page-config')
export class PageConfigController {
  constructor(
    private readonly pageConfigService: PageConfigService,
    private readonly pageService: PageService,
  ) {}

  @Post('create')
  async create(
    @Body() createPageConfigDto: CreatePageConfigDto,
    @PayloadUser() user: any,
  ) {
    console.log(user);

    const { pageId } = createPageConfigDto;
    const pageConfig = await this.pageConfigService.create({
      ...createPageConfigDto,
      userId: user.userId,
      userName: user.name,
    });

    await this.pageService.updateOne(pageId, {
      currentConfigId: pageConfig.id,
    });
    return pageConfig;
  }

  @Post('findByPageId')
  findByPageId(@Body() searchPageConfigDto: SearchPageConfigDto) {
    return this.pageConfigService.findByPageId(searchPageConfigDto.pageId);
  }
}
