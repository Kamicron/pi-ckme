import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoFolder } from './entities/photo-folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoFolder])],
  exports: [TypeOrmModule]
})
export class PhotoFolderModule {}
