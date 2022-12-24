import { UsersEntity } from 'src/users/users.entity';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne } from 'typeorm';
import { RolesEntity } from './roles.entity';

@Entity({name: 'users_roles'})
export class UsersRolesEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.id, { 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    user: UsersEntity;

    @ManyToOne(() => RolesEntity, (role: RolesEntity) => role.name, { 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    role: RolesEntity;
};
