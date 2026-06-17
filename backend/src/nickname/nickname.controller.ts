import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { NicknameService } from './nickname.service';
import { GenerationOptions } from './interfaces/nickname-result.interface';
import { NicknameStyle } from './enums/nickname-style.enum';

@Controller('nicknames')
export class NicknameController {
  constructor(private readonly nicknameService: NicknameService) {}

  @Get('generate')
  async generateNickname(
    @Query('style') style?: NicknameStyle,
    @Query('pattern') pattern?: string,
    @Query('minLength') minLength?: string,
    @Query('maxLength') maxLength?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('avoidTransformations') avoidTransformations?: string,
  ) {
    const options: GenerationOptions = {
      style,
      pattern: pattern as any,
      minLength: minLength ? parseInt(minLength, 10) : undefined,
      maxLength: maxLength ? parseInt(maxLength, 10) : undefined,
      firstName,
      lastName,
      avoidTransformations: avoidTransformations === 'true',
    };

    return this.nicknameService.generateNickname(options);
  }

  @Get('generate-batch')
  async generateMultipleNicknames(
    @Query('count') count: string = '5',
    @Query('style') style?: NicknameStyle,
    @Query('pattern') pattern?: string,
    @Query('minLength') minLength?: string,
    @Query('maxLength') maxLength?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
  ) {
    const options: GenerationOptions = {
      style,
      pattern: pattern as any,
      minLength: minLength ? parseInt(minLength, 10) : undefined,
      maxLength: maxLength ? parseInt(maxLength, 10) : undefined,
      firstName,
      lastName,
    };

    const numCount = Math.min(parseInt(count, 10) || 5, 20);
    return this.nicknameService.generateMultipleNicknames(numCount, options);
  }

  @Post('generate-for-person')
  async generateForPerson(@Body() body: {
    firstName: string;
    lastName: string;
    count?: number;
    style?: NicknameStyle;
  }) {
    const count = Math.min(body.count || 5, 20);
    const options: GenerationOptions = {
      firstName: body.firstName,
      lastName: body.lastName,
      style: body.style,
    };

    return this.nicknameService.generateMultipleNicknames(count, options);
  }
}
