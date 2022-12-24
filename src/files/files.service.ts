import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as uuid from 'uuid';
import * as fs from 'fs';

@Injectable()
export class FilesService
{
    async RemoveFile(fileType: string, fileName: string)
    {
        try
        {
            const fileUrl = path.join(__dirname, '..', 'content', fileType, fileName);
            await fs.promises.rm(fileUrl);
        }
        catch (error)
        {
            throw new HttpException('file remove error', HttpStatus.INTERNAL_SERVER_ERROR);   
        }
    }

    async CreateFile(file: Express.Multer.File): Promise<{ name: string, ext: string, type: string }>
    {
        // check the valid loaded file
        const fileExt = path.extname(file.originalname).toLowerCase();
        const fileType = this._GetFileTypeByExt(fileExt);
        if (fileType === 'unknown')
        {
            throw new HttpException('invalid file type', HttpStatus.INTERNAL_SERVER_ERROR);   
        }
        
        // generate unique file name
        const fileName = uuid.v4() + fileExt;
        
        // make the directory if it not exists in the file path
        const filePath = path.join(__dirname, '..', 'content', fileType);
        const isPathExists = fs.existsSync(filePath);
        if (!isPathExists)
        {
            await fs.promises.mkdir(filePath, { recursive: true });
        }

        // write file to the storage using streams
        const writeStream = fs.createWriteStream(path.join(filePath, fileName));
        writeStream.on('error', (error) =>
        {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);   
        });
        writeStream.write(file.buffer);
        writeStream.end();

        // return object with file information
        const fileInfo = {
            name: fileName,
            ext: fileExt,
            type: fileType,
        };
        return fileInfo;
    }

    async LoadVideoStream(fileName: string, request: any, response: any)
    {
        const fileUrl = path.join(__dirname, '..', 'content', 'video', fileName);
        const fileStat = await fs.promises.stat(fileUrl);
        const fileSize = fileStat.size;
        const range = request.headers.range;
        
        // if video is big it has ranges and we need to send it chunk by chunk
        if (range)
        {
            const parts = range.replace('bytes=', '').split('-');
            const start = parseInt(parts[0]);
            const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            // create http header
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            };
            response.writeHead(HttpStatus.PARTIAL_CONTENT, head); // partial content - 206
            
            // put video chunk to stream pipe
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
            response.writeHead(HttpStatus.OK, head);

            const readStream = fs.createReadStream(fileUrl);
            readStream.pipe(response);
        }
    }

    private _GetFileTypeByExt(fileExt: string): string
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
};
