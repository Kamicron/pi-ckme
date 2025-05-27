import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async createOrUpdateUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    googleId: string;
    accessToken: string;
  }): Promise<User> {
    try {
      this.logger.log(`Attempting to create/update user with email: ${userData.email}`);
      
      let user = await this.findByEmail(userData.email);

      if (user) {
        this.logger.log(`User found, updating existing user: ${user.id}`);
        // Mise à jour de l'utilisateur existant
        Object.assign(user, userData);
        return this.usersRepository.save(user);
      }

      // Générer un nom d'utilisateur unique basé sur le prénom et le nom
      const baseUsername = this.generateBaseUsername(userData.firstName, userData.lastName);
      const username = await this.generateUniqueUsername(baseUsername);
      
      this.logger.log(`Creating new user with generated username: ${username}`);
      
      // Création d'un nouvel utilisateur avec le nom d'utilisateur généré
      user = this.usersRepository.create({
        ...userData,
        username
      });
      
      return this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(`Error creating/updating user: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
  
  /**
   * Génère un nom d'utilisateur de base à partir du prénom et du nom
   */
  private generateBaseUsername(firstName: string, lastName: string): string {
    if (!firstName && !lastName) {
      return `user_${Date.now()}`;
    }
    
    const firstPart = firstName ? firstName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const lastPart = lastName ? lastName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    
    if (firstPart && lastPart) {
      return `${firstPart}.${lastPart}`;
    } else if (firstPart) {
      return firstPart;
    } else if (lastPart) {
      return lastPart;
    } else {
      return `user_${Date.now()}`;
    }
  }
  
  /**
   * Génère un nom d'utilisateur unique en ajoutant un numéro si nécessaire
   */
  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    // Vérifier si le nom d'utilisateur de base est déjà utilisé
    const existingUser = await this.usersRepository.findOne({ where: { username: baseUsername } });
    
    if (!existingUser) {
      return baseUsername;
    }
    
    // Si le nom d'utilisateur existe déjà, ajouter un nombre aléatoire
    let counter = 1;
    let uniqueUsername = `${baseUsername}${counter}`;
    
    while (await this.usersRepository.findOne({ where: { username: uniqueUsername } })) {
      counter++;
      uniqueUsername = `${baseUsername}${counter}`;
    }
    
    return uniqueUsername;
  }
}
