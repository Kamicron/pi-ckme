import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirstName } from './entities/first-name.entity';

@Controller('first-names')
export class FirstNameController {
  constructor(
    @InjectRepository(FirstName)
    private readonly firstNameRepository: Repository<FirstName>,
  ) {}

  @Get('count')
  async count(): Promise<number> {
    return await this.firstNameRepository.count();
  }
}
