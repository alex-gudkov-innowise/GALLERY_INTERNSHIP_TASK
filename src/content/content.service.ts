import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentEntity } from '../content/content.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { EditContentDTO } from './dto/edit-content.dto';
import { CreateContentDTO } from './dto/create-content.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ContentService
{
    constructor(
        @InjectRepository(ContentEntity) private readonly contentRepository: Repository<ContentEntity>,
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
    ) {}

    async CreateContent(contentFile: Express.Multer.File, myUserId: number, dto: CreateContentDTO)
    {
        const fileInfo = await this.filesService.CreateFile(contentFile);

        // add uploaded content to database
        const myUser = await this.usersService.GetUserById(myUserId);
        const content = this.contentRepository.create({
            fileName: fileInfo.name,
            fileExt: fileInfo.ext,
            type: fileInfo.type,
            description: dto.description,
            user: myUser,
        });
        await this.contentRepository.save(content);

        return { fileName: fileInfo.name };
    }
    
    async RemoveContent(contentId: number, myUserId: number)
    {
        const content = await this.contentRepository.findOne({ 
            where: { id: contentId },
            relations: { user: true } // include user entity into related content entity
        });

        if (!content)
        {
            throw new HttpException('content not found', HttpStatus.NOT_FOUND);   
        }
        if (content.user.id !== myUserId)
        {
            throw new HttpException('user has no access to content', HttpStatus.FORBIDDEN);   
        }

        // delete record from database
        return await this.contentRepository.delete({ id: contentId });
    }

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

    async LoadVideo(fileName: string, request: any, response: any)
    {
        return this.filesService.LoadVideoStream(fileName, request, response);
    }
};

