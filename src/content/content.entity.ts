import { UsersEntity } from 'src/users/users.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ClosedContentEntity } from './closed-content.entity';

@Entity({name: 'content'})
export class ContentEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    fileName: string;

    @Column({ nullable: false })
    fileExt: string;

    @Column({ nullable: false })
    type: string;

    @Column()
    description: string;

    // 
    @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.id)
    user: UsersEntity;

    // 
    @OneToMany(() => ClosedContentEntity, (closedContent: ClosedContentEntity) => closedContent.content)
    closedContent: ContentEntity[];
};
