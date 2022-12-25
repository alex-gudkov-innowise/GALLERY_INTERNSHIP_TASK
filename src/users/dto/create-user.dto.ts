// DTO (Data Transfer Object) — design pattern for data transforming between the application subsystems
export class CreateUserDTO
{
    readonly email: string;
    readonly password: string;
    readonly name: string;
    bio?: string;
    isClosedGallery?: boolean;
    isConfirmedEmail?: boolean;
};