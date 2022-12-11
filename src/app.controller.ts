import { Controller, Get } from '@nestjs/common';

@Controller('/api')
export class AppController
{
    // чтобы GetUsers стала endpoint и мы могли отправлять HTTP запрос, пометим ее декоратором
    @Get('/users')
    GetUsers()
    {
        return [
            { id: 1, name: 'Alex' },
            { id: 2, name: 'Stas' },
        ];
    }
};

