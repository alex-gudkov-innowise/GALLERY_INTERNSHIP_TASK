import { UsersEntity } from 'src/users/users.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'content'})
export class ContentEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

    @Column()
    fileExt: string;

    @Column()
    type: string;

    @Column()
    description: string;

    @ManyToOne(() => UsersEntity, (user) => user.id)
    user: UsersEntity;
};
