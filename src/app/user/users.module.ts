import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UsersPolicy } from './users.policy';
import { UsersService } from './users.service';

@Module({
  controllers: [UserController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const secretKey = config.get<string>('SECRET') || 'somesecretkey';
        return {
          secret: secretKey,
          signOptions: { expiresIn: '3600s' }
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [UsersService, UsersPolicy]
})
export class UserModule {}
