import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageUploadService } from './image-upload.service';
import { ImageUploadController } from './image-upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ImageUploadController],
  providers: [ImageUploadService],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
