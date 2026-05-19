import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TechniquesModule } from './techniques/techniques.module';

import { Ceinture } from './entities/ceinture.entity';
import { Utilisateur } from './entities/utilisateur.entity';
import { Technique } from './entities/technique.entity';
import { UtilisateurTechnique } from './entities/utilisateur-technique.entity';
import { TechniqueLiaison } from './entities/technique-liaison.entity';

@Module({
  imports: [
    // Charge le .env globalement
    ConfigModule.forRoot({ isGlobal: true }),

    // Connexion TypeORM / MySQL.
    // synchronize : crée/met à jour les tables automatiquement.
    //   - dev  : true (pratique)
    //   - prod : false recommandé (mettre DB_SYNCHRONIZE=false dans .env)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')) || 3306,
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Ceinture, Utilisateur, Technique, UtilisateurTechnique, TechniqueLiaison],
        synchronize: config.get<string>('DB_SYNCHRONIZE') !== 'false',
        logging: config.get<string>('DB_LOGGING') === 'true',
        charset: 'utf8mb4',
      }),
    }),

    AuthModule,
    UsersModule,
    TechniquesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
