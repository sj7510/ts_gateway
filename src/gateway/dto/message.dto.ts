import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  pattern: string;

  @IsNotEmpty()
  @IsObject()
  data: any;
}
