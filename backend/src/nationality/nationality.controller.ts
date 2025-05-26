import { Controller, Get, Query } from '@nestjs/common';
import { NationalityService } from './nationality.service';
import { Nationality } from './entities/nationality.entity';
import { NationalityWithDistribution } from './interfaces/nationality-with-distribution.interface';

@Controller('nationalities')
export class NationalityController {
  constructor(private readonly nationalityService: NationalityService) {}

  @Get()
  findAll(): Promise<Nationality[]> {
    return this.nationalityService.findAll();
  }

  @Get('distribution')
  getEthnicityDistribution(
    @Query('nationalityId') nationalityId?: string
  ): Promise<NationalityWithDistribution[]> {
    return this.nationalityService.getEthnicityDistribution(nationalityId);
  }

  @Get('count')
  async count(): Promise<number> {
    const nationalities = await this.nationalityService.findAll();
    return nationalities.length;
  }
}
