import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserLogin, UserRegister } from './users.model';
import { randomstring } from 'randomstring';
import * as bcrypt from 'bcrypt';
import { IRequestUser } from 'src/core/interfaces/user-request.interface';
import { JwtService } from '@nestjs/jwt';
import { IAuthUserResponse } from './user.dto';
@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService) {}

  async register(model: UserRegister): Promise<IAuthUserResponse> {
    let user = await User.findOneBy({ email: model.email });

    if (user) {
      throw new HttpException('Email Unavailable', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const salt = await bcrypt.genSalt(Number(process.env.BSALT_NUMBER || 10));
    const passwordHash = bcrypt.hashSync(model.password, salt);

    user = new User();
    user.email = model.email;
    user.name = model.name;
    user.password = passwordHash;
    user.role = 'admin';

    await user.commit();

    const token = await this.signUser(user);
    const userResponse = await user.responseDto();

    return {
      token,
      ...userResponse
    };
  }

  async login(model: UserLogin): Promise<IAuthUserResponse> {
    const user = await User.findOneBy({ email: model.email });

    if (user && bcrypt.compareSync(model.password, user.password)) {
      const token = await this.signUser(user);
      const userResponse = await user.responseDto();

      return {
        token,
        ...userResponse
      };
    }

    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  private async signUser(user: User) {
    const session = randomstring(16);

    const salt = await bcrypt.genSalt(Number(process.env.BSALT_NUMBER || 10));
    const sessionHash = bcrypt.hashSync(session, salt);

    user.tokenSafety = sessionHash;
    await user.commit();

    const payload: IRequestUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      session
    };

    return this.jwtService.sign(payload);
  }
}
