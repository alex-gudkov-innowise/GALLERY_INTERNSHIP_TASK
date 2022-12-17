import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { UsersEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService
{
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    SignInUser(dto: CreateUserDTO)
    {
        throw new Error('Method not implemented.');
    }

    async SignUpUser(dto: CreateUserDTO)
    {
        // check that this user still not registered
        const candidateUser = await this.usersService.GetUserByEmail(dto.email);
        if (candidateUser)
        {
            throw new HttpException('this user already exists', HttpStatus.BAD_REQUEST);
        }

        // password must be stored in hashed form
        const hashedPassword = await hash(dto.password, 5);

        // now we can create user
        const user = await this.usersService.CreateUser({
            email: dto.email,
            password: hashedPassword
        });

        // return access token
        return this.GenerateAccessToken(user);
    }

    private GenerateAccessToken(user: UsersEntity)
    {
        // payload object is stored in token
        const payload = {
            email: user.email,
            id: user.id
        };
        
        // generate a JWT containing payload (generating options were specified in the module registering)
        // JWT (JSON Web Token) – standard for creating access tokens based on the JSON format
        const token = this.jwtService.sign(payload);
        
        return {
            token: token
        };
    }
};
