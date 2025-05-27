import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nationality } from './entities/nationality.entity';
import { NationalityService } from './nationality.service';
import { NationalityController } from './nationality.controller';
import { NationalityEthnicityDistribution } from './entities/nationality-ethnicity-distribution.entity';
import { EthnicityModule } from '../ethnicity/ethnicity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nationality, NationalityEthnicityDistribution]),
    EthnicityModule
  ],
  providers: [NationalityService],
  controllers: [NationalityController],
  exports: [TypeOrmModule, NationalityService]
})
export class NationalityModule {}
