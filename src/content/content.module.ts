import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentEntity } from './content.entity';
import { UsersEntity } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { forwardRef } from '@nestjs/common/utils';
import { ContentService } from './content.service';
import { FilesModule } from 'src/files/files.module';

@Module({
    controllers: [ContentController],
    providers: [ContentService],
    imports: [
        TypeOrmModule.forFeature([UsersEntity, ContentEntity]),
        AuthModule,
        forwardRef(() => UsersModule),
        FilesModule,
    ],
    exports: [
        ContentService,
    ]
})
export class ContentModule {};
