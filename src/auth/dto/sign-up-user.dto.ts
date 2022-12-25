import { IsEmail, IsString, Length } from "class-validator";

export class SignUpUserDTO
{
    @IsString({ message: 'need to be a string'})
    @IsEmail({}, { message: 'invalid e-mail'})
    readonly email: string;

    @IsString({ message: 'need to be a string'})
    @Length(4, 32, { message: 'longer than 4 and shorter than 32'})
    readonly password: string;

    @IsString({ message: 'need to be a string'})
    readonly name: string;
};