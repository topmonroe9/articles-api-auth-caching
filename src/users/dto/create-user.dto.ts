import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({})
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
