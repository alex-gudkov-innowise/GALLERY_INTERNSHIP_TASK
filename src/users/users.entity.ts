import { RefreshTokensEntity } from 'src/auth/refresh-tokens.entity';
import { ContentEntity } from 'src/gallery/content.entity';
import { Entity, Column, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({name: 'users'})
export class UsersEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: false })
    isAdmin: boolean;

    // one user can have many refresh tokens
    @OneToMany(() => RefreshTokensEntity, (refreshToken) => refreshToken.refreshToken)
    refreshTokens: RefreshTokensEntity[];

    // one user can have many images/videos
    @OneToMany(() => ContentEntity, (content) => content.id)
    content: ContentEntity[];
};
