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
import { ClosedContentEntity } from './content/closed-content.entity';
import { RolesModule } from './roles/roles.module';
import { RolesEntity } from './roles/roles.entity';
import { UsersRolesEntity } from './roles/users-roles.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `./.${process.env.NODE_ENV}.env`,
        }),
        MailerModule.forRoot({
            // create transporter object using the default SMTP transport
            transport: {
                host: process.env.MAILER_HOST,
                port: Number(process.env.MAILER_PORT),
                secure: Boolean(process.env.MAILER_IS_SECURE), // true for port 465, false for others
                auth: {
                    user: process.env.MAILER_USER,
                    pass: process.env.MAILER_PASS,
                },
            },
            defaults: {
                from: process.env.MAILER_FROM, // sender address
            },
        }),
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, 'content', 'image'), // serve images as static
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.TYPEORM_HOST,
            port: Number(process.env.TYPEORM_PORT),
            username: process.env.TYPEORM_USER,
            password: process.env.TYPEORM_PASSWORD,
            database: process.env.TYPEORM_DATABASE,
            entities: [
                UsersEntity,
                RefreshTokensEntity,
                ContentEntity,
                ClosedContentEntity,
                RolesEntity,
                UsersRolesEntity,
            ],
            synchronize: false,
            migrations: ['./dist/migrations/*.js'],
            migrationsRun: false,
        }),
        RolesModule,
        UsersModule,
        AuthModule,
        ContentModule,
        FilesModule,
        UsersRolesEntity,
    ],
})
export class AppModule {}
