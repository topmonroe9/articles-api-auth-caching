import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({
    status: 401,
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({
    status: 404,
  })
  @ApiResponse({
    status: 401,
  })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({
    status: 409,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
