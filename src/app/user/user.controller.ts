import { Controller, Post, Body } from '@nestjs/common';
import { IAuthUserResponse } from './user.dto';
import { UsersPolicy } from './users.policy';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { UserLogin, UserRegister } from './users.model';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService, private readonly usersPolicy: UsersPolicy) {}

  @Post('register')
  async register(@Body() model: UserRegister): Promise<IAuthUserResponse> {
    return this.usersService.register(model);
  }

  @Post('login')
  async login(@Body() model: UserLogin): Promise<IAuthUserResponse> {
    return this.usersService.login(model);
  }
}
