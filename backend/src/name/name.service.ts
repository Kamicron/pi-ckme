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

  async getRandomPerson(options?: {
    gender?: Gender;
    nationalityId?: string;
    ethnicityId?: string;
  }) {
    // 1. Get all nationalities and pick one randomly if not specified
    const nationalities = await this.nationalityService.findAll();
    let randomNationality;
    
    if (options?.nationalityId) {
      randomNationality = nationalities.find(n => n.id === options.nationalityId);
      if (!randomNationality) {
        throw new Error(`Nationality with ID ${options.nationalityId} not found`);
      }
    } else {
      randomNationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    }

    // 2. Get distribution for this nationality
    const distributions =
      await this.nationalityService.getEthnicityDistribution(
        randomNationality.id,
      );
    const distribution = distributions[0]; // Since we filtered by ID, there's only one

    // 3. Pick a random ethnicity based on distribution weights or use specified one
    let ethnicity;
    if (options?.ethnicityId) {
      // Si une ethnicité spécifique est demandée, on la recherche d'abord dans la distribution
      ethnicity = distribution.ethnicities.find(e => e.id === options.ethnicityId);
      
      // Si l'ethnicité n'est pas trouvée dans la distribution, on va chercher directement dans la base de données
      if (!ethnicity) {
        try {
          // Récupérer toutes les ethnicités disponibles
          const allEthnicities = await this.nationalityService.findAllEthnicities();
          const requestedEthnicity = allEthnicities.find(e => e.id === options.ethnicityId);
          
          if (requestedEthnicity) {
            // Si l'ethnicité existe dans la base de données, on l'utilise même si elle n'est pas associée à la nationalité
            ethnicity = {
              id: requestedEthnicity.id,
              nameFr: requestedEthnicity.nameFr,
              percentage: 0 // On met 0 car cette ethnicité n'est pas dans la distribution normale
            };
          } else {
            throw new Error(`Ethnicity with ID ${options.ethnicityId} not found in database`);
          }
        } catch (error) {
          this.logger.error(`Error finding ethnicity: ${error.message}`);
          throw error;
        }
      }
    } else {
      ethnicity = this.pickRandomEthnicity(distribution.ethnicities);
    }

    // 4. Use specified gender or pick a random one
    const gender: Gender = options?.gender || (Math.random() < 0.5 ? 'male' : 'female');

    // 5. Get a random first name matching ethnicity and gender
    try {
      const names = await this.firstNameRepository.find({
        where: { ethnicityId: ethnicity.id, gender },
      });

      if (names.length === 0) {
        throw new Error(
          `No first names found for ethnicity ${ethnicity.nameFr} (${ethnicity.id}) and gender ${gender}`,
        );
      }

      const firstName = names[Math.floor(Math.random() * names.length)];

      // 6. Get a random last name matching ethnicity
      const lastNames = await this.lastNameRepository.find({
        where: { ethnicityId: ethnicity.id },
      });

      if (lastNames.length === 0) {
        throw new Error(
          `No last names found for ethnicity ${ethnicity.nameFr} (${ethnicity.id})`,
        );
      }

      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      return {
        nationality: {
          id: randomNationality.id,
          nameFr: randomNationality.nameFr,
        },
        ethnicity: {
          id: ethnicity.id,
          nameFr: ethnicity.nameFr,
        },
        gender,
        firstName: firstName.name,
        lastName: lastName.name,
      };
    } catch (error) {
      this.logger.error(`Error generating person: ${error.message}`);
      throw error;
    }
  }

  private pickRandomEthnicity(
    ethnicities: Array<{ id: string; nameFr: string; percentage: number }>,
  ) {
    // Convertir les pourcentages en poids cumulatifs
    let total = 0;
    const weights = ethnicities.map((e) => {
      total += e.percentage;
      return total;
    });

    // Générer un nombre aléatoire entre 0 et le total
    const random = Math.random() * total;

    // Trouver l'ethnie correspondante
    const index = weights.findIndex((weight) => random <= weight);
    return ethnicities[index];
  }
}
