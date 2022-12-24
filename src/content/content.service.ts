import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentEntity } from '../content/content.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateContentDTO } from './dto/create-content.dto';
import { FilesService } from 'src/files/files.service';
import { ClosedContentEntity } from './closed-content.entity';
import { EditContentDTO } from './dto/edit-content.dto';

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

        return { fileName: content.fileName };
    }
    
    async EditContent(contentId: number, contentFile: Express.Multer.File, dto: EditContentDTO, myUserId: number)
    {
        const isMyUserAdmin = await this.usersService.IsUserAdmin(myUserId);
        const content = await this.contentRepository.findOne({ 
            where: { id: contentId },
            relations: { user: true } // include user relation to compare with myUserId
        });

        // checks
        if (!content)
        {
            throw new HttpException('content not found', HttpStatus.NOT_FOUND);   
        }
        if (content.user.id !== myUserId && !isMyUserAdmin) // admin can also close content of users
        {
            throw new HttpException('current user has no access to content', HttpStatus.FORBIDDEN);   
        }
        
        // remove old and create new file if content file was attached
        if (contentFile)
        {
            await this.filesService.RemoveFile(content.type, content.fileName);
            const fileInfo = await this.filesService.CreateFile(contentFile);
            content.fileName = fileInfo.name;
            content.fileExt = fileInfo.ext;
            content.type = fileInfo.type;
        }

        // update description if description filed was specified
        if (dto.description)
        {
            content.description = dto.description;
            await this.contentRepository.save(content);
        }

        return { fileName: content.fileName };
    }
    
    async RemoveContent(contentId: number, myUserId: number)
    {
        const isMyUserAdmin = await this.usersService.IsUserAdmin(myUserId);
        const content = await this.contentRepository.findOne({ 
            where: { id: contentId },
            relations: { user: true } // include user relation to compare with myUserId
        });

        if (!content)
        {
            throw new HttpException('content not found', HttpStatus.NOT_FOUND);   
        }
        if (content.user.id !== myUserId && !isMyUserAdmin) // admin can also remove content of users
        {
            throw new HttpException('user has no access to content', HttpStatus.FORBIDDEN);   
        }

        // remove content file
        await this.filesService.RemoveFile(content.type, content.fileName);

        // delete record from database
        await this.contentRepository.delete(content);

        return { message: 'content removed' };
    }

    async CloseOneContentForOneUser(contentId: number, myUserId: number, userId: number)
    {
        const isMyUserAdmin = await this.usersService.IsUserAdmin(myUserId);
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
        if (content.user.id !== myUserId && !isMyUserAdmin) // admin can also close content of users
        {
            throw new HttpException('current user has no access to content', HttpStatus.FORBIDDEN);   
        }
        if (!user)
        {
            throw new HttpException('specified user not registered', HttpStatus.NOT_FOUND);   
        }

        // check if this record already exists
        const candidateClosedContent = await this.closedContentRepository.findOneBy({
            content: content,
            user: user
        });
        if (candidateClosedContent)
        {
            return { message: 'one content closed for one user' };
        }
        
        // otherwise add this record to database
        const closedContent = this.closedContentRepository.create({
            content: content,
            user: user,
        });
        await this.closedContentRepository.save(closedContent);

        return { message: 'one content closed for one user' };
    }

    async CloseAllMyContentForOneUser(myUserId: number, userId: number)
    {
        const user = await this.usersService.GetUserById(userId);
        if (!user)
        {
            throw new HttpException('specified user not registered', HttpStatus.NOT_FOUND);   
        }

        await this.closedContentRepository.query(`
            INSERT INTO closed_content("userId", "contentId")
            (
                SELECT $1 AS id_user, content.id AS id_content
                FROM content
                WHERE content."userId" = $2
                EXCEPT
                SELECT closed_content."userId", closed_content."contentId" FROM closed_content
            );
        `, [userId, myUserId]);

        return { message: 'all content closed for one user' };
    }
    
    async CloseAllMyContentForAllUsers(myUserId: number)
    {
        await this.closedContentRepository.query(`
            INSERT INTO closed_content("userId", "contentId")
            (
                SELECT users.id AS id_user, content.id AS id_content
                FROM content, users
                WHERE content."userId" = $1 AND users.id != $1
                EXCEPT
                SELECT closed_content."userId", closed_content."contentId" FROM closed_content
            );
        `, [myUserId]);

        return { message: 'all content closed for all users' };
    }

    async GetUserVideos(userId: number, myUserId: number)
    {
        const isMyUserAdmin = await this.usersService.IsUserAdmin(myUserId);
        let contentVideos: ContentEntity[];

        // select all videos available for myUser
        if (isMyUserAdmin)
        {
            contentVideos = await this.contentRepository.query(`
                SELECT * FROM content
                WHERE content."userId" = $1 AND content.type = 'video';
            `, [userId]);
        }
        else
        {
            contentVideos = await this.contentRepository.query(`
            SELECT * FROM content
            WHERE content."userId" = $1 AND content.type = 'video' AND content.id NOT IN (
                SELECT closed_content."contentId" FROM closed_content
                WHERE closed_content."userId" = $2
            );
            `, [userId, myUserId]);
        }

        return contentVideos;
    }
    
    async GetUserImages(userId: number, myUserId: number): Promise<ContentEntity[]>
    {
        const isMyUserAdmin = await this.usersService.IsUserAdmin(myUserId);
        let contentImages: ContentEntity[];

        // select all videos available for myUser
        if (isMyUserAdmin)
        {
            contentImages = await this.contentRepository.query(`
                SELECT * FROM content
                WHERE content."userId" = $1 AND content.type = 'image';
            `, [userId]);
        }
        else
        {
            contentImages = await this.contentRepository.query(`
            SELECT * FROM content
            WHERE content."userId" = $1 AND content.type = 'image' AND content.id NOT IN (
                SELECT closed_content."contentId" FROM closed_content
                WHERE closed_content."userId" = $2
            );
            `, [userId, myUserId]);
        }

        return contentImages;
    }

    async LoadVideo(fileName: string, request: any, response: any)
    {
        return this.filesService.LoadVideoStream(fileName, request, response);
    }
};
