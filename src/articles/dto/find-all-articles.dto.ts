import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllArticlesDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDateString()
  publishedFrom?: Date;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDateString()
  publishedTo?: Date;

  @ApiProperty({
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
