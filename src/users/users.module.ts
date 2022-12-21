import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { RefreshTokensEntity } from 'src/auth/refresh-tokens.entity';
import { GalleryModule } from 'src/gallery/gallery.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        TypeOrmModule.forFeature([UsersEntity, RefreshTokensEntity]),
        forwardRef(() => AuthModule), // use forwardRef() to avoid circular dependency between modules
        forwardRef(() => GalleryModule),
    ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {};
