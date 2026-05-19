import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Utilisateur } from '../entities/utilisateur.entity';
import { Ceinture } from '../entities/ceinture.entity';
import { UtilisateurTechnique } from '../entities/utilisateur-technique.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur, Ceinture, UtilisateurTechnique]),
    JwtModule.register({}),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
})
export class UsersModule {}
