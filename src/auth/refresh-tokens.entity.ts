import { UsersEntity } from 'src/users/users.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({name: 'refresh_tokens'})
export class RefreshTokensEntity
{
    @PrimaryColumn()
    refreshToken: string;

    @ManyToOne(() => UsersEntity, (user) => user.id)
    user: UsersEntity;
};
