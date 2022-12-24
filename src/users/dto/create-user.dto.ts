// DTO (Data Transfer Object) — design pattern for data transfer between application subsystems
export class CreateUserDTO
{
    readonly email: string;
    readonly password: string;
    readonly name: string;
};