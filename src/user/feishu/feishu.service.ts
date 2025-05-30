import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  getAppToken,
  getUserToken,
  refreshUserToken,
} from '@/helper/feishu/auth';
import { BusinessException } from '@/common/exception/business.exception';
import { messages } from '@/helper/feishu/message';
import { GetUserTokenDto } from '@/user/feishu/feishu.dto';
import { BUSINESS_ERROR_CODE } from '@/common/exception/business.error.codes';

@Injectable()
export class FeishuService {
  private readonly APP_TOKEN_CACHE_KEY: string;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.APP_TOKEN_CACHE_KEY = 'APP_TOKEN_CACHE_KEY';
  }

  async getAppToken() {
    let appToken: string;
    appToken = await this.cacheManager.get(this.APP_TOKEN_CACHE_KEY);
    if (!appToken) {
      const response = await getAppToken();
      console.log(response);
      if (response.code === 0) {
        // token 有效期为 2 小时，在此期间调用该接口 token 不会改变。当 token 有效期小于 30 分的时候,再次请求获取 token 的时候，会生成一个新的 token，与此同时老的 token 依然有效。
        appToken = response.app_access_token;
        await this.cacheManager.set(
          this.APP_TOKEN_CACHE_KEY,
          appToken,
          response.expire - 60,
        );
      } else {
        throw new BusinessException('获取飞书 appToken 失败');
      }
    }
    return appToken;
  }

  async sendMessage(receive_id_type: any, params: any) {
    const app_token = await this.getAppToken();
    return messages(receive_id_type, params, app_token as string);
  }

  async getUserToken(code: string) {
    const app_token = await this.getAppToken();
    const dto: GetUserTokenDto = {
      code,
      app_token,
    };
    const res: any = await getUserToken(dto);
    if (res.code !== 0) {
      throw new BusinessException(res.msg);
    }
    return res.data;
  }

  async setUserCacheToken(tokenInfo: any) {
    const { refresh_token, access_token, user_id, expires_in } = tokenInfo;

    // 缓存用户的 token
    await this.cacheManager.set(
      `feishu_user_token__${user_id}`,
      access_token,
      expires_in - 60,
    );

    // 缓存用户的 fresh token
    await this.cacheManager.set(
      `feishu_refresh_token__${user_id}`,
      refresh_token,
      expires_in - 60,
    );
  }

  async getCachedUserToken(userId: string) {
    let userToken: string = await this.cacheManager.get(
      `feishu_user_token__${userId}`,
    );
    // 如果 token 失效
    if (!userToken) {
      const refreshToken: string = await this.cacheManager.get(
        `feishu_refresh_token__${userId}`,
      );
      if (!refreshToken) {
        throw new BusinessException({
          code: BUSINESS_ERROR_CODE.TOKEN_INVALID,
          message: 'token 已失效',
        });
      }
      // 获取新的用户 token
      const usrTokenInfo = await this.getUserTokenByRefreshToken(refreshToken);
      // 更新缓存的用户 token
      await this.setUserCacheToken(usrTokenInfo);
      userToken = usrTokenInfo.access_token;
    }
    return userToken;
  }

  async getUserTokenByRefreshToken(refreshToken: string) {
    return await refreshUserToken({
      refreshToken,
      app_token: await this.getAppToken(),
    });
  }
}
