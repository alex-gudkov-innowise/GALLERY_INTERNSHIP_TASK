import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/api')
export class AppController
{
    // чтобы сервис использовать внутри controller необходимо внедрить (dependency injection)
    constructor(private appService: AppService)
    {

    }

    // чтобы GetUsers стала endpoint и мы могли отправлять HTTP запрос, пометим ее декоратором
    @Get('/users')
    GetUsers()
    {
        return this.appService.GetUsers();
    }
};

