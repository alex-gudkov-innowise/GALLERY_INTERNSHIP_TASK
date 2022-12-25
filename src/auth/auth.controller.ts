import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { AuthGuard } from './auth.guard';
import { ValidationPipe } from 'src/validation/validation.pipe';
import { SignUpUserDTO } from './dto/sign-up-user.dto';
import { SignInUserDTO } from './dto/sign-in-user.dto';

@Controller('auth')
export class AuthController
{
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('/sign-up')
    @UsePipes(ValidationPipe)
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
