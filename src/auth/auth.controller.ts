import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.Dto';
import { AuthGuard } from './auth.guard';
import { ValidationPipe } from 'src/validation/validation.pipe';
import { SignUpUserDto } from './dto/sign-up-user.Dto';
import { SignInUserDto } from './dto/sign-in-user.Dto';

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/sign-up')
    @UsePipes(ValidationPipe)
    signUpUser(
        @Body() Dto: SignUpUserDto
    ) {
        return this.authService.signUpUser(Dto);
    }

    @Get('/confirm/:confirmationToken')
    confirmUserEmail(
        @Param('confirmationToken') confirmationToken: string
    ) {
        return this.authService.confirmUserEmail(confirmationToken);
    }

    @Post('/sign-in')
    signInUser(
        @Body() Dto: SignInUserDto
    ) {
        return this.authService.signInUser(Dto);
    }

    @Post('/new-token')
    getNewAccessToken(
        @Body() Dto: RefreshTokenDto
    ) {
        return this.authService.getNewAccessToken(Dto);
    }

    @UseGuards(AuthGuard)
    @Post('/sign-out')
    signOutUser(
        @Body() Dto: RefreshTokenDto
    ) {
        return this.authService.signOutUser(Dto);
    }
}
