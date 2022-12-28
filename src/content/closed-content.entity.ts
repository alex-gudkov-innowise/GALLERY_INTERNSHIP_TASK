import { UsersEntity } from 'src/users/users.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContentEntity } from './content.entity';

@Entity({ name: 'closed_content' })
export class ClosedContentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    user: UsersEntity;

    @ManyToOne(() => ContentEntity, (content: ContentEntity) => content.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    content: ContentEntity;
}
