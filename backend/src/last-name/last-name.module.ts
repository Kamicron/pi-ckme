import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LastName } from './entities/last-name.entity';
import { LastNameController } from './last-name.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LastName])],
  controllers: [LastNameController],
  exports: [TypeOrmModule]
})
export class LastNameModule {}
