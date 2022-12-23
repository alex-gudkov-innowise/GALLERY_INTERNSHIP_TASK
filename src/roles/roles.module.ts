import { Module, forwardRef } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './roles.entity';
import { UsersEntity } from 'src/users/users.entity';
import { UsersRolesEntity } from './users-roles.entity';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    controllers: [RolesController],
    providers: [RolesService],
    imports: [
        TypeOrmModule.forFeature([RolesEntity, UsersEntity, UsersRolesEntity]),
        forwardRef(() => UsersModule),
        JwtModule.register({}), // register the module 
    ],
    exports: [
        RolesService,
        JwtModule
    ]
})
export class RolesModule {};
