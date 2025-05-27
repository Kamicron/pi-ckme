import { Controller, Get, Query } from '@nestjs/common';
import { NameService } from './name.service';

@Controller('names')
export class NameController {
  constructor(private readonly nameService: NameService) {}

  @Get('random-person')
  getRandomPerson(
    @Query('gender') gender?: 'male' | 'female',
    @Query('nationalityId') nationalityId?: string,
    @Query('ethnicityId') ethnicityId?: string,
  ) {
    return this.nameService.getRandomPerson({
      gender,
      nationalityId,
      ethnicityId,
    });
  }
}
