import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { SignUpUserDTO } from './dto/sign-in-user.dto';
import { SignInUserDTO } from './dto/sign-up-user.dto';

@Controller('auth')
export class AuthController
{
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/sign-up')
    SignUp(@Body() dto: SignUpUserDTO)
    {
        console.log('/auth/sign-up');

        return this.authService.SignUpUser(dto);
    }
    
    @Post('/sign-in')
    SignIn(@Body() dto: SignInUserDTO)
    {
        console.log('/auth/sign-in');
        
        return this.authService.SignInUser(dto);
    }
};
