import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { UsersRolesEntity } from './users-roles.entity';

@Entity({ name: 'roles' })
export class RolesEntity {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;

    // one role can belong to many users
    @OneToMany(() => UsersRolesEntity, (roleUser: UsersRolesEntity) => roleUser.role)
    roleUsers: UsersRolesEntity[];
}
