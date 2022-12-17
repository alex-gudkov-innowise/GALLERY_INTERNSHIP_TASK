import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function Bootstrap()
{
    const port = process.env.PORT ?? 5000;
    const app = await NestFactory.create(AppModule);

    await app.listen(port, () =>
    {
        console.log(`Server started on port ${port}...`);
    });
}

Bootstrap();
