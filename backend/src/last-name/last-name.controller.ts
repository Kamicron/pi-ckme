import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LastName } from './entities/last-name.entity';

@Controller('last-names')
export class LastNameController {
  constructor(
    @InjectRepository(LastName)
    private readonly lastNameRepository: Repository<LastName>,
  ) {}

  @Get('count')
  async count(): Promise<number> {
    return await this.lastNameRepository.count();
  }
}
