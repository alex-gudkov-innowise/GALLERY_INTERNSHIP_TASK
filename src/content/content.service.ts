import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentEntity } from '../content/content.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostContentDTO } from '../content/dto/post-content.dto';
import * as path from 'path';
import * as uuid from 'uuid';
import * as fs from 'fs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ContentService
{
    constructor(
        @InjectRepository(ContentEntity) private readonly contentRepository: Repository<ContentEntity>,
        private readonly usersService: UsersService,
    ) {}

    async GetUserVideos(id: number)
    {
        // select all user's videos
        const user = await this.usersService.GetUserById(id);
        const videos = await this.contentRepository.findBy({ user: user, type: 'video' });
        
        return videos;
    }
    
    async GetUserImages(id: number)
    {
        // select all user's images
        const user = await this.usersService.GetUserById(id);
        const images = await this.contentRepository.findBy({ user: user, type: 'image' });
        
        return images;
    }

    async LoadVideoStream(fileName: string, request: any, response: any)
    {
        const fileUrl = path.join(__dirname, '..', 'content', 'video', fileName);
        const fileStat = await fs.promises.stat(fileUrl);
        const fileSize = fileStat.size;
        const range = request.headers.range;
        
        if (range)
        {
            const parts = range.replace('bytes=', '').split('-');
            const start = parseInt(parts[0]);
            const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            };
            response.writeHead(206, head); // 206 - partial content
            
            const readStream = fs.createReadStream(fileUrl, {
                start: start,
                end: end,
            });
            readStream.pipe(response);
        }
        else
        {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            response.writeHead(200, head);

            const readStream = fs.createReadStream(fileUrl);
            readStream.pipe(response);
        }
    }

    async PostMyContent(myId: number, dto: PostContentDTO, contentFile: Express.Multer.File)
    {
        try
        {
            // check the valid loaded file
            const fileExt = path.extname(contentFile.originalname).toLowerCase();
            const contentType = this._GetContentTypeByExt(fileExt);
            if (contentType === 'unknown')
            {
                throw new HttpException('invalid file type', HttpStatus.INTERNAL_SERVER_ERROR);   
            }
            
            // generate unique file name
            const fileName = uuid.v4() + fileExt;
            
            // make the directory if it not exists in the file path
            const filePath = path.join(__dirname, '..', 'content', contentType);
            const isPathExists = fs.existsSync(filePath);
            if (!isPathExists)
            {
                await fs.promises.mkdir(filePath, { recursive: true });
            }

            // write file to the storage
            const writeStream = fs.createWriteStream(path.join(filePath, fileName));
            writeStream.on('error', (error) =>
            {
                console.error(error);
            });
            writeStream.write(contentFile.buffer);
            writeStream.end();

            // add posted content to database
            const myUser = await this.usersService.GetUserById(myId);
            const content = this.contentRepository.create({
                filePath: filePath,
                fileName: fileName,
                fileExt: fileExt,
                type: contentType,
                description: dto.description,
                user: myUser
            });
            await this.contentRepository.save(content);

            return { fileName: fileName };
        }
        catch (error)
        {
            throw new HttpException('content posting error', HttpStatus.INTERNAL_SERVER_ERROR);   
        }
        
    }
    
    private _GetContentTypeByExt(fileExt: string): string
    {
        const imageExts = (process.env.IMAGE_EXTENSIONS).split(' ');
        if (imageExts.includes(fileExt))
        {
            return 'image'
        }

        const videoExts = (process.env.VIDEO_EXTENSIONS).split(' ');
        if (videoExts.includes(fileExt))
        {
            return 'video'
        }

        return 'unknown';
    }
}

