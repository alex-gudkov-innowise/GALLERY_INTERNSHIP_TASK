import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException, UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { SignInUserDTO } from './dto/sign-up-user.dto';
import { SignUpUserDTO } from './dto/sign-in-user.dto';

@Injectable()
export class AuthService
{
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async SignInUser(dto: SignInUserDTO)
    {
        // verify the user and get it if the data is valid
        const user = await this.VerifyUser(dto);

        // return access token
        return this.GenerateAccessToken(user);
    }

    private async VerifyUser(dto: SignInUserDTO): Promise<UsersEntity>
    {
        // check that this user is registered
        const user = await this.usersService.GetUserByEmail(dto.email);
        if (!user)
        {
            throw new UnauthorizedException({ message: 'user not found' });
        }
        
        // check the password correctness
        const isEqualPassword = await compare(dto.password, user.password);
        if (!isEqualPassword)
        {
            throw new UnauthorizedException({ message: 'wrong password' });
        }

        return user;
    }

    async SignUpUser(dto: SignUpUserDTO)
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

    private GenerateAccessToken(user: UsersEntity): { token: string }
    {
        // payload object is stored in token
        const payload = {
            email: user.email,
            id: user.id
        };
        
        // generate a JWT containing payload (generating options were specified in the module registering)
        // JWT (JSON Web Token) – standard for creating access tokens based on the JSON format
        const token = this.jwtService.sign(payload);
        
        return { token: token };
    }
};
