import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ethnicity } from './entities/ethnicity.entity';
import { EthnicityService } from './ethnicity.service';
import { EthnicityController } from './ethnicity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ethnicity])],
  providers: [EthnicityService],
  controllers: [EthnicityController],
  exports: [TypeOrmModule, EthnicityService]
})
export class EthnicityModule {}
