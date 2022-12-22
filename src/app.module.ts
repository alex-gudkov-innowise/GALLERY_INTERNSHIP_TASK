import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UsersEntity } from './users/users.entity';
import { AuthModule } from './auth/auth.module';
import { RefreshTokensEntity } from './auth/refresh-tokens.entity';
import { ContentEntity } from './content/content.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ContentModule } from './content/content.module';
import { FilesModule } from './files/files.module';

@Module({
    controllers: [],
    providers: [],
    imports: [
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, 'content', 'image'), // serve images as static
        }),
        ConfigModule.forRoot({
            envFilePath: `./.${process.env.NODE_ENV}.env`
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USERNAME,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            entities: [UsersEntity, RefreshTokensEntity, ContentEntity],
            synchronize: true, // remove soon...
        }),
        UsersModule,
        AuthModule,
        ContentModule,
        FilesModule,
    ]
})
export class AppModule {};
