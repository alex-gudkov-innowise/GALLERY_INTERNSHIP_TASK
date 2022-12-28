import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService
    ) {}

    // the endpoint can be reached if canActivate() returns true
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // get the request object from the context
        const request = context.switchToHttp().getRequest();

        // get the authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new HttpException('empty authorization header', HttpStatus.UNAUTHORIZED);
        }
        const tokenType = authHeader.split(' ')[0]; // token type
        const tokenValue = authHeader.split(' ')[1]; // token value

        // check token type and its availability
        if (tokenType !== 'Bearer' || !tokenValue) {
            throw new HttpException('bearer token error', HttpStatus.UNAUTHORIZED);
        }

        try {
            // verify() throws Error() if the token not verified (expired or invalid)
            // otherwise it returns the decoded token
            const userPayload = this.jwtService.verify(tokenValue, {
                secret: process.env.ACCESS_TOKEN_SECRET,
            });

            // get the appropriate user
            const user = await this.usersService.getUserById(userPayload.id);
            if (!user) {
                throw new Error('user not found');
            }
            if (!user.isConfirmedEmail) {
                throw new Error('user email not confirmed');
            }
            request.userId = user.id; // put user id in request object for further using

            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.FORBIDDEN);
            }

            throw new HttpException('user not authorized', HttpStatus.FORBIDDEN);
        }
    }
}
