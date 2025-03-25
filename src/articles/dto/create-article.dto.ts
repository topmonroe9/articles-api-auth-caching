import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: Date;
}
