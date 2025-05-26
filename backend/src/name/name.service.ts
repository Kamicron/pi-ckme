import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirstName } from '../first-name/entities/first-name.entity';
import { LastName } from '../last-name/entities/last-name.entity';
import { NationalityService } from '../nationality/nationality.service';

type Gender = 'male' | 'female';

@Injectable()
export class NameService {
  private readonly logger = new Logger(NameService.name);

  constructor(
    @InjectRepository(FirstName)
    private readonly firstNameRepository: Repository<FirstName>,
    @InjectRepository(LastName)
    private readonly lastNameRepository: Repository<LastName>,
    private readonly nationalityService: NationalityService,
  ) {}

  async getRandomPerson() {
    // 1. Get all nationalities and pick one randomly
    const nationalities = await this.nationalityService.findAll();
    const randomNationality = nationalities[Math.floor(Math.random() * nationalities.length)];

    // 2. Get distribution for this nationality
    const distributions = await this.nationalityService.getEthnicityDistribution(randomNationality.id);
    const distribution = distributions[0]; // Since we filtered by ID, there's only one

    // 3. Pick a random ethnicity based on distribution weights
    const ethnicity = this.pickRandomEthnicity(distribution.ethnicities);

    // 4. Pick a random gender
    const gender: Gender = Math.random() < 0.5 ? 'male' : 'female';

    // 5. Get a random first name matching ethnicity and gender
    try {
      const names = await this.firstNameRepository.find({
        where: { ethnicityId: ethnicity.id, gender }
      });
      
      if (names.length === 0) {
        throw new Error(`No first names found for ethnicity ${ethnicity.nameFr} (${ethnicity.id}) and gender ${gender}`);
      }
      
      const firstName = names[Math.floor(Math.random() * names.length)];

      // 6. Get a random last name matching ethnicity
      const lastNames = await this.lastNameRepository.find({
        where: { ethnicityId: ethnicity.id }
      });
      
      if (lastNames.length === 0) {
        throw new Error(`No last names found for ethnicity ${ethnicity.nameFr} (${ethnicity.id})`);
      }

      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      return {
        nationality: {
          id: randomNationality.id,
          nameFr: randomNationality.nameFr
        },
        ethnicity: {
          id: ethnicity.id,
          nameFr: ethnicity.nameFr
        },
        gender,
        firstName: firstName.name,
        lastName: lastName.name
      };
    } catch (error) {
      this.logger.error(`Error generating person: ${error.message}`);
      throw error;
    }
  }

  private pickRandomEthnicity(ethnicities: Array<{ id: string; nameFr: string; percentage: number }>) {
    // Convertir les pourcentages en poids cumulatifs
    let total = 0;
    const weights = ethnicities.map(e => {
      total += e.percentage;
      return total;
    });

    // Générer un nombre aléatoire entre 0 et le total
    const random = Math.random() * total;

    // Trouver l'ethnie correspondante
    const index = weights.findIndex(weight => random <= weight);
    return ethnicities[index];
  }
}
