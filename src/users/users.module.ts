import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { RefreshTokensEntity } from 'src/auth/refresh-tokens.entity';
import { ContentModule } from 'src/content/content.module';
import { ClosedContentEntity } from 'src/content/closed-content.entity';
import { UsersRolesEntity } from 'src/roles/users-roles.entity';
import { RolesEntity } from 'src/roles/roles.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        TypeOrmModule.forFeature([UsersEntity, RefreshTokensEntity, ClosedContentEntity, UsersRolesEntity, RolesEntity]),
        forwardRef(() => AuthModule), // use forwardRef() to avoid circular dependency between modules
        forwardRef(() => ContentModule),
        forwardRef(() => RolesModule),
    ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {};
