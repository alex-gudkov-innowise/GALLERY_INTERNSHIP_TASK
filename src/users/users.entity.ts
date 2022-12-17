import { RefreshTokensEntity } from 'src/auth/refresh-tokens.entity';
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

    @OneToMany(() => RefreshTokensEntity, (refreshToken) => refreshToken.refreshToken)
    refreshTokens: RefreshTokensEntity[];
};
