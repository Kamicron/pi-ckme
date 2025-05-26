import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Ethnicity } from './ethnicity/entities/ethnicity.entity';
import { FirstName } from './first-name/entities/first-name.entity';
import { LastName } from './last-name/entities/last-name.entity';
import { Nationality } from './nationality/entities/nationality.entity';
import { PhotoFolder } from './photo-folder/entities/photo-folder.entity';
import { EthnicityModule } from './ethnicity/ethnicity.module';
import { FirstNameModule } from './first-name/first-name.module';
import { LastNameModule } from './last-name/last-name.module';
import { NationalityModule } from './nationality/nationality.module';
import { PhotoFolderModule } from './photo-folder/photo-folder.module';
import { NationalityEthnicityDistribution } from './nationality/entities/nationality-ethnicity-distribution.entity';
import { NameModule } from './name/name.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Ethnicity, FirstName, LastName, Nationality, PhotoFolder, NationalityEthnicityDistribution],
      synchronize: false, // Désactivé pour éviter les conflits avec la base existante
    }),
    AuthModule,
    UsersModule,
    EthnicityModule,
    FirstNameModule,
    LastNameModule,
    NationalityModule,
    PhotoFolderModule,
    NameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
