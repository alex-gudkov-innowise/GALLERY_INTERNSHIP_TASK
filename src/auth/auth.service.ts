import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException, UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { RefreshTokensEntity } from './refresh-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { SignInUserDTO } from './dto/sign-in-user.dto';
import { SignUpUserDTO } from './dto/sign-up-user.dto';
import { MailerService } from '@nestjs-modules/mailer/dist';

@Injectable()
export class AuthService
{
    constructor(
        @InjectRepository(RefreshTokensEntity) private readonly refreshTokensRepository: Repository<RefreshTokensEntity>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
    ) {}

    async SignInUser(dto: SignInUserDTO)
    {
        // verify the user and get it if the data is valid
        const user = await this._VerifyUser(dto);

        // return generated tokens
        return {
            accessToken: this._GenerateAccessToken(user),
            refreshToken: await this._GenerateRefreshToken(user),
        };
    }

    async SignUpUser(dto: SignUpUserDTO)
    {
        // check that the user still not registered
        const candidateUser = await this.usersService.GetUserByEmail(dto.email);
        if (candidateUser)
        {
            throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
        }

        // create user
        const hashedPassword = await hash(dto.password, 5); // password must be stored in hashed form
        const user = await this.usersService.CreateUser({
            ...dto,
            password: hashedPassword, // replace password with hashed password
        });

        // create confirmation token
        const confirmationToken = this._GenerateConfirmationToken(user);

        // send confirmation email
        this._SendConfirmationEmail(user, confirmationToken);

        // return generated tokens
        return {
            accessToken: this._GenerateAccessToken(user),
            refreshToken: await this._GenerateRefreshToken(user),
        };
    }

    private async _SendConfirmationEmail(user: UsersEntity, confirmationToken: string)
    {
        // send email (transport object was defined in app module)
        await this.mailerService.sendMail({
            to: user.email, // list of receivers
            subject: 'Verify email', // subject line
            html: `
                <h1>
                    Dear ${user.name},
                </h1>
                <p style="margin-bottom:32px">
                    Someone has created an account with this email address. If this was you, click the link below to verify your email address
                </p>
                <a style="background:dodgerblue;line-height:24px;text-decoration:none;color:white;font-weight:bold;padding:12px 24px 12px 24px" href="http://localhost:5005/auth/confirm/${confirmationToken}">
                    CONFIRM EMAIL
                </a>
                <br>
                <br>
            `, // html body
        });
    }

    async ConfirmUserEmail(confirmationToken: string)
    {
        try
        {
            const userPayload = this.jwtService.verify(confirmationToken, {
                secret: process.env.CONFIRMATION_TOKEN_SECRET
            });

            const user = await this.usersService.GetUserById(userPayload.id);
            await this.usersService.UpdateUser(user, { isConfirmedEmail: true });

            return { isConfirmedEmail: user.isConfirmedEmail };
        }
        catch (error)
        {
            throw new HttpException('confirmation token expired or invalid', HttpStatus.FORBIDDEN);
        }
    }

    private _GenerateConfirmationToken(user: UsersEntity): string
    {
        const payload = {
            id: user.id
        };
        
        const confirmationToken = this.jwtService.sign(payload, {
            secret: process.env.CONFIRMATION_TOKEN_SECRET,
            expiresIn: process.env.CONFIRMATION_TOKEN_EXPIRES_IN,
        });

        return confirmationToken;
    }

    
    async SignOutUser(dto: RefreshTokenDTO)
    {
        // delete refreshToken from database
        return await this.refreshTokensRepository.delete({ refreshToken: dto.refreshToken });
    }

    private async _VerifyUser(dto: SignInUserDTO): Promise<UsersEntity>
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

    private _GenerateAccessToken(user: UsersEntity): string
    {
        // payload object is stored in token
        const payload = {
            id: user.id
        };
        
        // sign a new token
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        });

        return accessToken;
    }

    private async _GenerateRefreshToken(user: UsersEntity): Promise<string>
    {
        // payload object is stored in token
        const payload = {
            id: user.id
        };
        
        // sign a new token
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        });
        
        // add token to database
        const entity = new RefreshTokensEntity();
        entity.refreshToken = refreshToken; 
        entity.user = user;
        await this.refreshTokensRepository.save(entity);

        return refreshToken;
    }

    async GetNewAccessToken(dto: RefreshTokenDTO): Promise<{ accessToken: string; }>
    {
        try
        {
            // verify() throws exception if token is expired
            // otherwise it returns decoded token
            const user = this.jwtService.verify(dto.refreshToken, {
                secret: process.env.REFRESH_TOKEN_SECRET
            });

            return {
                accessToken: this._GenerateAccessToken(user)
            };
        }
        catch (error)
        {   
            // delete refreshToken from database
            await this.refreshTokensRepository.delete({ refreshToken: dto.refreshToken });

            throw new HttpException('refresh token is expired', HttpStatus.FORBIDDEN);
        }
    }
};
