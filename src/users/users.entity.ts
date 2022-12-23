import { RefreshTokensEntity } from 'src/auth/refresh-tokens.entity';
import { ClosedContentEntity } from 'src/content/closed-content.entity';
import { ContentEntity } from 'src/content/content.entity';
import { UsersRolesEntity } from 'src/roles/users-roles.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({name: 'users'})
export class UsersEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column()
    name: string;

    @Column()
    bio: string;

    // one user can have many refresh tokens
    @OneToMany(() => RefreshTokensEntity, (refreshToken) => refreshToken.refreshToken)
    refreshTokens: RefreshTokensEntity[];

    // one user can have many images/videos
    @OneToMany(() => ContentEntity, (content) => content.id)
    content: ContentEntity[];

    // one user can have no access to many content 
    @OneToMany(() => ClosedContentEntity, (closedContent: ClosedContentEntity) => closedContent.user)
    closedContent: ContentEntity[];

    // one user can have many roles
    @OneToMany(() => UsersRolesEntity, (userRole: UsersRolesEntity) => userRole.user)
    userRoles: UsersRolesEntity[];
};
