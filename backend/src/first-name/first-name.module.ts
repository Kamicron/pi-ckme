import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirstName } from './entities/first-name.entity';
import { FirstNameController } from './first-name.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FirstName])],
  controllers: [FirstNameController],
  exports: [TypeOrmModule]
})
export class FirstNameModule {}
