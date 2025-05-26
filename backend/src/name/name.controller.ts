import { Controller, Get } from '@nestjs/common';
import { NameService } from './name.service';

@Controller('names')
export class NameController {
  constructor(private readonly nameService: NameService) {}

  @Get('random-person')
  getRandomPerson() {
    return this.nameService.getRandomPerson();
  }
}
