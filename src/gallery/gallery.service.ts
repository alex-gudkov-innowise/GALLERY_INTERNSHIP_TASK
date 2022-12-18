import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentEntity } from './content.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostContentDTO } from './dto/post-content.dto';
import * as path from 'path';
import * as uuid from 'uuid';
import * as fs from 'fs';

@Injectable()
export class GalleryService
{
    constructor(
        @InjectRepository(ContentEntity) private readonly contentRepository: Repository<ContentEntity>,
    ) {}

    GetMyContent()
    {
        console.log(0);
    }
    
    GetUserContent(userId: number)
    {
        console.log(userId);
    }

    async PostMyContent(dto: PostContentDTO, contentFile: Express.Multer.File)
    {
        try
        {
            // generate unique file name
            const fileName = uuid.v4() + path.extname(contentFile.originalname);
            console.log(fileName);
            
            // make the directory if it not exists in the file path
            const filePath = path.join(__dirname, '..', 'content');
            const isPathExists = fs.existsSync(filePath);
            if (!isPathExists)
            {
                await fs.promises.mkdir(filePath, { recursive: true });
            }

            // write the file
            const writeStream = fs.createWriteStream(path.join(filePath, fileName));
            
            writeStream.on('error', (error) =>
            {
                console.error(error);
            });

            writeStream.write(contentFile.buffer);
            writeStream.end();

            // add content to database
            // ...
            
            return { fileName: fileName };
        }
        catch (error)
        {
            console.log(error);
            
            throw new HttpException('content posting error', HttpStatus.INTERNAL_SERVER_ERROR);   
        }
        
    }
}
