import { parse } from 'yaml';
import * as path from 'node:path';
import * as fs from 'node:fs';

// 获取项目运行环境
export const getEnv = () => {
  return process.env.RUNNING_ENV || 'dev';
};

// 读取项目配置
export const getConfig = () => {
  const environment = getEnv();
  const yamlPath = path.join(process.cwd(), `./.config/.${environment}.yaml`);
  const file = fs.readFileSync(yamlPath, 'utf8');
  return parse(file);
};
