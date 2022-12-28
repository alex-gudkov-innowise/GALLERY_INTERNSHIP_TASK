export interface UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    bio?: string;
    isClosedGallery?: boolean;
    isConfirmedEmail?: boolean;
}
