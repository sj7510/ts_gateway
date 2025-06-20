import {
  Controller,
  UseGuards,
  Res,
  Get,
  Query,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import { FeishuAuthGuard } from './guards/feishu-auth.guard';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetTokenByApplications } from './auth.dto';
import { Public } from './constants';
import { PayloadUser } from '@/helper';

@ApiTags('用户认证')
@Controller({
  path: 'auth',
  version: [VERSION_NEUTRAL],
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '飞书 Auth2 授权登录',
    description:
      '通过 code 获取`access_token`https://open.feishu.cn/open-apis/authen/v1/index?app_id=cli_xxxxxx&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080%2Fauth',
  })
  @UseGuards(FeishuAuthGuard)
  @Public()
  @Get('/feishu/auth2')
  async getFeishuTokenByApplications(
    @PayloadUser() user: Payload,
    @Res({ passthrough: true }) response: any,
    @Query() query: GetTokenByApplications,
  ) {
    console.log('query', query);
    const { access_token } = await this.authService.login(user);
    response.setCookie('jwt', access_token, {
      path: '/',
    });
    return access_token;
  }

  @ApiOperation({
    summary: '解析 token',
    description: '解析 token 信息',
  })
  @Get('/token/info')
  async getTokenInfo(@PayloadUser() user: Payload) {
    return user;
  }
}
