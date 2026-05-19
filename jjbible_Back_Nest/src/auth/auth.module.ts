import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Utilisateur } from '../entities/utilisateur.entity';
import { Ceinture } from '../entities/ceinture.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur, Ceinture]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
