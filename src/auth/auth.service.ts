import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException, UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsersEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { RefreshTokensEntity } from './refresh-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { SignUpUserDto } from './dto/sign-up-user.dto';
import { MailerService } from '@nestjs-modules/mailer/dist';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(RefreshTokensEntity)
        private readonly refreshTokensRepository: Repository<RefreshTokensEntity>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
    ) {}

    async signInUser(dto: SignInUserDto) {
        // verify the user and get it if the data is valid
        const user = await this._verifyUser(dto);

        // return generated tokens
        return {
            accessToken: this._generateAccessToken(user),
            refreshToken: await this._generateRefreshToken(user),
        };
    }

    async signUpUser(dto: SignUpUserDto) {
        // check that the user still not registered
        const candidateUser = await this.usersService.getUserByEmail(dto.email);
        if (candidateUser) {
            throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
        }

        // create user
        const hashedPassword = await bcryptjs.hash(dto.password, 5); // password must be stored in hashed form
        const user = await this.usersService.createUser({
            ...dto,
            password: hashedPassword, // replace password with hashed password
        });

        // create confirmation token
        const confirmationToken = this._generateConfirmationToken(user);

        // send confirmation email
        this._sendConfirmationEmail(user, confirmationToken);

        // return generated tokens
        return {
            accessToken: this._generateAccessToken(user),
            refreshToken: await this._generateRefreshToken(user),
        };
    }

    private async _sendConfirmationEmail(user: UsersEntity, confirmationToken: string) {
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

    async confirmUserEmail(confirmationToken: string) {
        try {
            const userPayload = this.jwtService.verify(confirmationToken, {
                secret: process.env.CONFIRMATION_TOKEN_SECRET,
            });

            const user = await this.usersService.getUserById(userPayload.id);
            await this.usersService.updateUser(user, { isConfirmedEmail: true });

            return { isConfirmedEmail: user.isConfirmedEmail };
        } catch (error) {
            throw new HttpException('confirmation token expired or invalid', HttpStatus.FORBIDDEN);
        }
    }

    private _generateConfirmationToken(user: UsersEntity): string {
        const payload = {
            id: user.id,
        };

        const confirmationToken = this.jwtService.sign(payload, {
            secret: process.env.CONFIRMATION_TOKEN_SECRET,
            expiresIn: process.env.CONFIRMATION_TOKEN_EXPIRES_IN,
        });

        return confirmationToken;
    }

    async signOutUser(dto: RefreshTokenDto) {
        // delete refreshToken from database
        return await this.refreshTokensRepository.delete({ refreshToken: dto.refreshToken });
    }

    private async _verifyUser(dto: SignInUserDto): Promise<UsersEntity> {
        // check that this user is registered
        const user = await this.usersService.getUserByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException({ message: 'user not found' });
        }

        // check the password correctness
        const isEqualPassword = await bcryptjs.compare(dto.password, user.password);
        if (!isEqualPassword) {
            throw new UnauthorizedException({ message: 'wrong password' });
        }

        return user;
    }

    private _generateAccessToken(user: UsersEntity): string {
        // payload object is stored in token
        const payload = {
            id: user.id,
        };

        // sign a new token
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        });

        return accessToken;
    }

    private async _generateRefreshToken(user: UsersEntity): Promise<string> {
        // payload object is stored in token
        const payload = {
            id: user.id,
        };

        // sign a new token
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        });

        // add token to database
        const entity = new RefreshTokensEntity();
        entity.refreshToken = refreshToken;
        entity.user = user;
        await this.refreshTokensRepository.save(entity);

        return refreshToken;
    }

    async getNewAccessToken(dto: RefreshTokenDto): Promise<{ accessToken: string }> {
        try {
            // verify() throws exception if token is expired
            // otherwise it returns decoded token
            const user = this.jwtService.verify(dto.refreshToken, {
                secret: process.env.REFRESH_TOKEN_SECRET,
            });

            return {
                accessToken: this._generateAccessToken(user),
            };
        } catch (error) {
            // delete refreshToken from database
            await this.refreshTokensRepository.delete({ refreshToken: dto.refreshToken });

            throw new HttpException('refresh token is expired', HttpStatus.FORBIDDEN);
        }
    }
}
