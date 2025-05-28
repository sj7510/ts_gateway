import axios, { Method } from 'axios';
import { getConfig } from '@/utils';

const {
  FEISHU_CONFIG: { FEISHU_URL },
} = getConfig();

/**
 * 任意请求
 */
const request = async ({ url, option = {} }) => {
  try {
    return axios.request({ url, ...option });
  } catch (error) {
    throw error;
  }
};

interface IMethodV {
  method: Method;
  url: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: { [key: string]: string };
}

export interface IRequest {
  data: any;
  code: number;
}

/**
 * 带 version 的通用 api 请求
 */
const methodV = async ({
  url,
  method,
  headers,
  params = {},
  query = {},
}: IMethodV): Promise<IRequest> => {
  let sendUrl = '';
  if (/^(http:\/\/|https:\/\/)/.test(url)) {
    sendUrl = url;
  } else {
    sendUrl = `${FEISHU_URL}${url}`;
  }
  try {
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...headers,
        },
        url: sendUrl,
        method,
        params: query,
        data: {
          ...params,
        },
      })
        .then(({ data, status }) => {
          resolve({ data, code: status });
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    throw error;
  }
};

export { request, methodV };
