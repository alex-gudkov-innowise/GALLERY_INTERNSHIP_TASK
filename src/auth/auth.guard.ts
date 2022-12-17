import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

        // get the authorization header
        const authHeader = request.headers.authorization;

        // the header consists of 2 parts
        const tokenType = authHeader.split(' ')[0]; // token type
        const accessToken = authHeader.split(' ')[1]; // the access token itself

        // check token type and its availability
        if (tokenType !== 'Bearer' || !accessToken)
        {
            throw new UnauthorizedException({ message: 'token error' });
        }

        try
        {
            // verify() throws exception if the token is expired
            // otherwise it returns the decoded token
            const user = this.jwtService.verify(accessToken, {
                secret: process.env.ACCESS_TOKEN_SECRET
            });
            request.user = user;
            
            return true;
        }
        catch (error)
        {
            throw new HttpException('the user is not authorized or access token is expired', HttpStatus.FORBIDDEN);
        }
    }
};