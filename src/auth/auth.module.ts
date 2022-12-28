import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokensEntity } from './refresh-tokens.entity';
import { UsersEntity } from 'src/users/users.entity';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        forwardRef(() => UsersModule), // use forwardRef() to avoid circular dependency between modules
        TypeOrmModule.forFeature([RefreshTokensEntity, UsersEntity]),
        JwtModule.register({}), // register the module
    ],
    exports: [
        AuthService,
        JwtModule
    ],
})
export class AuthModule {}
