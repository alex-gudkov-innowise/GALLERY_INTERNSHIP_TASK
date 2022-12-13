import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/users.model';
import { UsersModule } from './users/users.module';

// помечаем класс декоратором Module (обертка которая добавляет классу/функции новый функционал)
@Module({
    // чтобы контроллеры заработали зарегистрируем их в модуле
    controllers: [
        
    ],

    // все что содержит логику и может использоваться в других компонентах
    providers: [
        
    ],

    // для импорта в модуль других модулей
    imports: [
        ConfigModule.forRoot({
            envFilePath: `./.${process.env.NODE_ENV}.env`
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USERNAME,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            models: [User],
            autoLoadModels: true
        }),
        UsersModule,
    ]
})
export class AppModule {};
