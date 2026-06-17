import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NicknameController } from './nickname.controller';
import { NicknameService } from './nickname.service';
import {
  NicknameFragment,
  NicknameStyle,
  NicknamePattern,
  NicknameTransformation,
  NicknameBlacklist,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NicknameFragment,
      NicknameStyle,
      NicknamePattern,
      NicknameTransformation,
      NicknameBlacklist,
    ]),
  ],
  controllers: [NicknameController],
  providers: [NicknameService],
  exports: [NicknameService],
})
export class NicknameModule {}
