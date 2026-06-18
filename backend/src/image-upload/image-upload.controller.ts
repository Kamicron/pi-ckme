import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadService } from './image-upload.service';

interface UploadImageDto {
  sex: string;
  ethnicity: string;
  fileName?: string;
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('images')
export class ImageUploadController {
  constructor(private readonly imageUploadService: ImageUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: UploadedFile,
    @Body() body: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!body.sex || !body.ethnicity) {
      throw new BadRequestException('Sex and ethnicity are required');
    }

    const result = await this.imageUploadService.uploadImage(
      file,
      body.sex,
      body.ethnicity,
      body.fileName,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return {
      success: true,
      fileId: result.fileId,
      fileName: result.fileName,
      url: result.url,
    };
  }
}
