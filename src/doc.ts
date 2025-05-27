import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export const generateDocument = (app: INestApplication) => {
  // 读取 package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageConfig = JSON.parse(packageJsonContent);

  const options = new DocumentBuilder()
    .setTitle(packageConfig.name)
    .setDescription(packageConfig.description)
    .setVersion(packageConfig.version)
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/doc', app, document);
};
