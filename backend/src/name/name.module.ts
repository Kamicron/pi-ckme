import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NameController } from './name.controller';
import { NameService } from './name.service';
import { FirstName } from '../first-name/entities/first-name.entity';
import { LastName } from '../last-name/entities/last-name.entity';
import { NationalityModule } from '../nationality/nationality.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FirstName, LastName]),
    NationalityModule
  ],
  controllers: [NameController],
  providers: [NameService],
  exports: [NameService]
})
export class NameModule {}
