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
    @Query('lite') lite?: string,
  ) {
    return this.nameService.getRandomPerson({
      gender,
      nationalityId,
      ethnicityId,
      lite: lite === 'true',
      includePrompt: true,
    });
  }

  @Get('random-persons')
  getRandomPersons(
    @Query('count') count?: string,
    @Query('gender') gender?: 'male' | 'female',
    @Query('nationalityId') nationalityId?: string,
    @Query('ethnicityId') ethnicityId?: string,
    @Query('lite') lite?: string,
  ) {
    const n = Math.min(Math.max(parseInt(count || '1', 10) || 1, 1), 50);
    return Promise.all(
      Array.from({ length: n }, () =>
        this.nameService.getRandomPerson({
          gender,
          nationalityId,
          ethnicityId,
          lite: lite !== 'false',
          includePrompt: false,
        }),
      ),
    );
  }
}
