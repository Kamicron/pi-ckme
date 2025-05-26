import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nationality } from './entities/nationality.entity';
import { NationalityService } from './nationality.service';
import { NationalityController } from './nationality.controller';
import { NationalityEthnicityDistribution } from './entities/nationality-ethnicity-distribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nationality, NationalityEthnicityDistribution])],
  providers: [NationalityService],
  controllers: [NationalityController],
  exports: [TypeOrmModule, NationalityService]
})
export class NationalityModule {}
