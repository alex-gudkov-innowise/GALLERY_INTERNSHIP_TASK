import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hasUncaughtExceptionCaptureCallback } from 'process';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate
{
    constructor(private readonly jwtService: JwtService) {}

    // the endpoint can be reached if canActivate() returns true
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
    {
        // get the request object from the context
        const request = context.switchToHttp().getRequest();

        try
        {
            // get the authorization header
            const authHeader = request.headers.authorization;

            // the header consists of 2 parts
            const tokenType = authHeader.split(' ')[0]; // get token type
            const token = authHeader.split(' ')[1]; // get the token itself

            // check token type and its availability
            if (tokenType !== 'Bearer' || !token)
            {
                throw new UnauthorizedException({ message: 'token error' });
            }

            // decode the token
            const user = this.jwtService.verify(token);
            console.log(user);
            request.user = user;

            return true;
        }
        catch (error)
        {
            throw new UnauthorizedException({ message: 'the user is not authorized' });
        }
    }
};