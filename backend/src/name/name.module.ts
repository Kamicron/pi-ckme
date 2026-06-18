import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NameController } from './name.controller';
import { NameService } from './name.service';
import { PortraitGeneratorService } from './portrait-generator.service';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { FirstName } from '../first-name/entities/first-name.entity';
import { LastName } from '../last-name/entities/last-name.entity';
import { NationalityModule } from '../nationality/nationality.module';
import { NicknameModule } from '../nickname/nickname.module';
import { ImageUploadModule } from '../image-upload/image-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FirstName, LastName]),
    NationalityModule,
    NicknameModule,
    ImageUploadModule
  ],
  controllers: [NameController],
  providers: [NameService, PortraitGeneratorService, ImageUploadService],
  exports: [NameService]
})
export class NameModule {}
