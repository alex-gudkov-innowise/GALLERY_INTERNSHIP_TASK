import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UsersModule,
        JwtModule.register({ // register hte module
            secret: process.env.PRIVATE_KEY ?? 'SECRET', // generation secret key
            signOptions: { // token options
                expiresIn: '24h' // token expiration time
            }
        })
    ]
})
export class AuthModule {};
