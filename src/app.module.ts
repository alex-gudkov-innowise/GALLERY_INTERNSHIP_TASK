import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// помечаем класс декоратором Module (обертка которая добавляет классу/функции новый функционал)
@Module({
    // чтобы контроллеры заработали зарегистрируем их в модуле
    controllers: [
        AppController
    ]
})
export class AppModule {};
