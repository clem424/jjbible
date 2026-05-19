import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { TechniquesController } from './techniques.controller';
import { TechniquesService } from './techniques.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Technique } from '../entities/technique.entity';
import { UtilisateurTechnique } from '../entities/utilisateur-technique.entity';
import { TechniqueLiaison } from '../entities/technique-liaison.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Technique, UtilisateurTechnique, TechniqueLiaison]),
    JwtModule.register({}),
  ],
  controllers: [TechniquesController],
  providers: [TechniquesService, JwtAuthGuard],
})
export class TechniquesModule {}
