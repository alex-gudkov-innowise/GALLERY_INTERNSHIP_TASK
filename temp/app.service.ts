import { Injectable } from '@nestjs/common';

// чтоба класс стал provider пометим его @Injectable (потому что будем inject его в controller)
@Injectable()
export class AppService
{
    GetUsers()
    {
        // всю логику выносим в сервис, чтобы controller оставался тонким
        return [
            { id: 1, name: 'Alex' },
            { id: 2, name: 'Stas' },
        ];
    }
};
