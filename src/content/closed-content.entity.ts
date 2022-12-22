import { UsersEntity } from 'src/users/users.entity';
import { Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ContentEntity } from './content.entity';

@Entity({name: 'closed_content'})
export class ClosedContentEntity
{
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.id)
    user: UsersEntity;

    @ManyToOne(() => ContentEntity, (content: ContentEntity) => content.id)
    content: ContentEntity;
};
