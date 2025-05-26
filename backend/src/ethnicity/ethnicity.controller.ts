import { Controller, Get, Param } from '@nestjs/common';
import { EthnicityService } from './ethnicity.service';

@Controller('ethnicities')
export class EthnicityController {
  constructor(private readonly ethnicityService: EthnicityService) {}

  @Get()
  findAll() {
    return this.ethnicityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ethnicityService.findOne(id);
  }
}
