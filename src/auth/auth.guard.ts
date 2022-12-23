import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate
{
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    // the endpoint can be reached if canActivate() returns true
    canActivate(context: ExecutionContext): boolean
    {
        // get the request object from the context
        const request = context.switchToHttp().getRequest();

        // get the authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader)
        {
            throw new HttpException('empty authorization header', HttpStatus.UNAUTHORIZED);
        }
        const tokenType = authHeader.split(' ')[0]; // token type
        const tokenValue = authHeader.split(' ')[1]; // token value

        // check token type and its availability
        if (tokenType !== 'Bearer' || !tokenValue)
        {
            throw new HttpException('bearer token error', HttpStatus.UNAUTHORIZED);
        }

        // verify() throws exception if the token not verified (expired or invalid)
        // otherwise it returns the decoded token
        try
        {
            const user = this.jwtService.verify(tokenValue, {
                secret: process.env.ACCESS_TOKEN_SECRET
            });
            request.user = user; // put user in request object for further using
            
            return true;
        }
        catch (error)
        {
            throw new HttpException('access token expired or invalid', HttpStatus.FORBIDDEN);
        }
    }
};