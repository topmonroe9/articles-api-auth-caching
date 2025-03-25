import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    const expiresIn = this.configService.get<number>('JWT_EXPIRATION', 3600);

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: expiresIn,
      }),
      expiresIn: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
