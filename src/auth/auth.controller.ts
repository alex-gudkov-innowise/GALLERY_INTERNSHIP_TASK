import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDTO } from './dto/sign-in-user.dto';
import { SignInUserDTO } from './dto/sign-up-user.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController
{
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('/sign-up')
    SignUpUser(@Body() dto: SignUpUserDTO)
    {
        return this.authService.SignUpUser(dto);
    }
    
    @Post('/sign-in')
    SignInUser(@Body() dto: SignInUserDTO)
    {
        return this.authService.SignInUser(dto);
    }

    @Post('/new-token')
    GetNewAccessToken(@Body() dto: RefreshTokenDTO)
    {
        return this.authService.GetNewAccessToken(dto);
    }

    @UseGuards(AuthGuard)
    @Post('/sign-out')
    SignOutUser(@Body() dto: RefreshTokenDTO)
    {
        return this.authService.SignOutUser(dto);
    }
};
