import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ethnicity } from './entities/ethnicity.entity';

@Injectable()
export class EthnicityService {
  constructor(
    @InjectRepository(Ethnicity)
    private readonly ethnicityRepository: Repository<Ethnicity>,
  ) {}

  async findAll(): Promise<Ethnicity[]> {
    return this.ethnicityRepository.find();
  }

  async findOne(id: string): Promise<Ethnicity> {
    return this.ethnicityRepository.findOne({
      where: { id },
      relations: ['nationalities'],
    });
  }
}
