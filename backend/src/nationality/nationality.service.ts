import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nationality } from './entities/nationality.entity';
import { NationalityEthnicityDistribution } from './entities/nationality-ethnicity-distribution.entity';
import { NationalityWithDistribution } from './interfaces/nationality-with-distribution.interface';
import { EthnicityService } from '../ethnicity/ethnicity.service';
import { Ethnicity } from '../ethnicity/entities/ethnicity.entity';

@Injectable()
export class NationalityService {
  constructor(
    @InjectRepository(Nationality)
    private readonly nationalityRepository: Repository<Nationality>,
    @InjectRepository(NationalityEthnicityDistribution)
    private readonly distributionRepository: Repository<NationalityEthnicityDistribution>,
    private readonly ethnicityService: EthnicityService,
  ) {}

  async findAll(): Promise<Nationality[]> {
    return this.nationalityRepository.find({
      order: {
        nameFr: 'ASC'
      }
    });
  }

  async findAllEthnicities(): Promise<Ethnicity[]> {
    return this.ethnicityService.findAll();
  }

  async getEthnicityDistribution(nationalityId?: string): Promise<NationalityWithDistribution[]> {
    const query = this.distributionRepository
      .createQueryBuilder('distribution')
      .leftJoinAndSelect('distribution.nationality', 'nationality')
      .leftJoinAndSelect('distribution.ethnicity', 'ethnicity')
      .where('distribution.percentage >= 0')
      .orderBy('nationality.nameFr', 'ASC')
      .addOrderBy('distribution.percentage', 'DESC');

    if (nationalityId) {
      query.andWhere('nationality.id = :nationalityId', { nationalityId });
    }

    const distributions = await query.getMany();
    const result: Record<string, NationalityWithDistribution> = {};

    // Grouper par nationalité
    distributions.forEach(dist => {
      const nationalityId = dist.nationality?.id;
      if (nationalityId && !result[nationalityId]) {
        result[nationalityId] = {
          id: dist.nationality.id,
          nameEn: dist.nationality.nameEn,
          nameFr: dist.nationality.nameFr,
          ethnicities: []
        };
      }

      if (nationalityId && dist.ethnicity) {
        result[nationalityId].ethnicities.push({
          id: dist.ethnicity.id,
          nameEn: dist.ethnicity.nameEn,
          nameFr: dist.ethnicity.nameFr,
          percentage: dist.percentage
        });
      }
    });

    // Trier les ethnicités par pourcentage pour chaque nationalité
    Object.values(result).forEach(nationality => {
      nationality.ethnicities.sort((a, b) => b.percentage - a.percentage);
    });

    return Object.values(result);
  }
}
