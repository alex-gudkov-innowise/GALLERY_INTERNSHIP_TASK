import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { RolesService } from 'src/roles/roles.service';
import { hash } from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,
        private readonly rolesService: RolesService,
    ) {
        this.checkMainAdmin(); // check the availability of main admin
    }

    private async checkMainAdmin() {
        // add main admin to database if it not exist
        let mainAdmin: UsersEntity = await this.usersRepository.findOneBy({ email: process.env.MAIN_ADMIN_MAIL });
        if (!mainAdmin) {
            // get admin role
            const adminRole = await this.rolesService.getRoleByName('ADMIN');

            // create admin user
            const dto: CreateUserDto = {
                email: process.env.MAIN_ADMIN_MAIL,
                password: await hash(process.env.MAIN_ADMIN_PASSWORD, 5),
                name: process.env.MAIN_ADMIN_NAME,
                isConfirmedEmail: true,
            };
            mainAdmin = await this.createUser(dto);
            console.log('Main Admin created:', mainAdmin);

            // give him admin role
            await this.rolesService.connectUserWithRole(mainAdmin, adminRole);
        }
    }

    async getAllUsers(): Promise<UsersEntity[]> {
        const allUsers = await this.usersRepository.find();
        return allUsers;
    }

    async getUser(id: number, email: string, name: string): Promise<UsersEntity | UsersEntity[]> {
        // priority: id > email > name
        if (id) {
            return this.getUserById(id);
        }
        if (email) {
            return this.getUserByEmail(email);
        }
        if (name) {
            return this.getUsersByName(name);
        }

        // return all users if query params not specified
        return this.getAllUsers();
    }

    async getUserById(id: number): Promise<UsersEntity> {
        const user = await this.usersRepository.findOneBy({ id: id });

        return user;
    }

    async getUserByEmail(userEmail: string): Promise<UsersEntity> {
        const user = await this.usersRepository.findOneBy({ email: userEmail });

        return user;
    }

    async getUsersByName(userName: string): Promise<UsersEntity[]> {
        const users = await this.usersRepository.findBy({ name: userName }); // many users can have same names

        return users;
    }

    async createUser(dto: CreateUserDto): Promise<UsersEntity> {
        // get default role (USER) from database
        const role = await this.rolesService.getRoleByName('USER');
        if (!role) {
            throw new HttpException('default role not exists', HttpStatus.BAD_REQUEST);
        }

        // add new user to database
        const user = this.usersRepository.create(dto);
        await this.usersRepository.save(user);

        // create new user-role relationship
        this.rolesService.connectUserWithRole(user, role);

        return user;
    }

    async updateUser(user: UsersEntity, dto: UpdateUserDto) {
        // update specified fields of user in database
        Object.keys(dto).forEach((key: string) => {
            user[key] = dto[key];
        });
        await this.usersRepository.save(user);
    }

    async isUserAdmin(userId: number): Promise<boolean> {
        const userRoles = await this.rolesService.getUserRolesByUserId(userId);
        for (const userRole of userRoles) {
            if (userRole.roleName === 'ADMIN') return true;
        }
    }

    async closeUserGallery(userId: number, myUserId: number) {
        const isMyUserAdmin = await this.isUserAdmin(myUserId);

        // checks
        if (userId != myUserId && !isMyUserAdmin) {
            // only user can close his gallery (admin can also close users gallery)
            throw new HttpException('current user has no access to content', HttpStatus.FORBIDDEN);
        }

        // update user in database
        const user = await this.getUserById(userId);
        await this.updateUser(user, { isClosedGallery: true });

        return { isClosedGallery: user.isClosedGallery };
    }
}
