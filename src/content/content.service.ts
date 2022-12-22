import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentEntity } from '../content/content.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { EditContentDTO } from './dto/edit-content.dto';
import { CreateContentDTO } from './dto/create-content.dto';
import { FilesService } from 'src/files/files.service';
import { ClosedContentEntity } from './closed-content.entity';
import { async } from 'rxjs';

@Injectable()
export class ContentService
{
    constructor(
        @InjectRepository(ContentEntity) private readonly contentRepository: Repository<ContentEntity>,
        @InjectRepository(ClosedContentEntity) private readonly closedContentRepository: Repository<ClosedContentEntity>,
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
            relations: { user: true } // include user relation to compare with myUserId
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

    async CloseOneContentForOneUser(contentId: number, myUserId: number, userId: number)
    {
        // get entities from database
        const content = await this.contentRepository.findOne({ 
            where: { id: contentId },
            relations: { user: true } // include user relation to compare with myUserId
        });
        const user = await this.usersService.GetUserById(userId);

        // checks
        if (!content)
        {
            throw new HttpException('content not found', HttpStatus.NOT_FOUND);   
        }
        if (content.user.id !== myUserId)
        {
            throw new HttpException('current user has no access to content', HttpStatus.FORBIDDEN);   
        }
        if (!user)
        {
            throw new HttpException('specified user not registered', HttpStatus.NOT_FOUND);   
        }

        // add new record to database
        const closedContent = this.closedContentRepository.create({
            content: content,
            user: user,
        });
        return await this.closedContentRepository.save(closedContent);
    }

    async CloseAllContentForOneUser(myUserId: number, userId: number)
    {
        const user = await this.usersService.GetUserById(userId);
        if (!user)
        {
            throw new HttpException('specified user not registered', HttpStatus.NOT_FOUND);   
        }

        return await this.contentRepository.query(`
            INSERT INTO closed_content("userId", "contentId")
            (
                SELECT $1 AS id_user, content.id AS id_content
                FROM content
                WHERE content."userId" = $2
                EXCEPT
                SELECT closed_content."userId", closed_content."contentId" FROM closed_content
            );
        `, [userId, myUserId]);
    }
    
    async CloseAllContentForAllUsers(myUserId: number)
    {
        return await this.contentRepository.query(`
            INSERT INTO closed_content("userId", "contentId")
            (
                SELECT users.id AS id_user, content.id AS id_content
                FROM content, users
                WHERE content."userId" = $1 AND users.id != $1
                EXCEPT
                SELECT closed_content."userId", closed_content."contentId" FROM closed_content
            );
        `, [myUserId]);
    }

    async GetUserVideos(userId: number, myUserId: number)
    {
        // select all videos available for myUser
        const videoContent = await this.contentRepository.query(`
            SELECT * FROM content
            WHERE content."userId" = $1 AND content.type = 'video' AND content.id NOT IN (
                SELECT closed_content."contentId" FROM closed_content
                WHERE closed_content."userId" = $2
            );
        `, [userId, myUserId]);

        return videoContent;
    }
    
    async GetUserImages(userId: number, myUserId: number)
    {
        // select all videos available for myUser
        const videoContent = await this.contentRepository.query(`
            SELECT * FROM content
            WHERE content."userId" = $1 AND content.type = 'image' AND content.id NOT IN (
                SELECT closed_content."contentId" FROM closed_content
                WHERE closed_content."userId" = $2
            );
        `, [userId, myUserId]);

        return videoContent;
    }

    async LoadVideo(fileName: string, request: any, response: any)
    {
        return this.filesService.LoadVideoStream(fileName, request, response);
    }
};
