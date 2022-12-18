import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { ContentEntity } from './content.entity';
import { UsersEntity } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [GalleryController],
  providers: [GalleryService],
  imports: [
    TypeOrmModule.forFeature([UsersEntity, ContentEntity]),
    AuthModule,
],
})
export class GalleryModule {}
