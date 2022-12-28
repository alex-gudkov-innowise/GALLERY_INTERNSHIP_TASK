import { UsersEntity } from 'src/users/users.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshTokensEntity {
    @PrimaryColumn()
    refreshToken: string;

    @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    user: UsersEntity;
}
