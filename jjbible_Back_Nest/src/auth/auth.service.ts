import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { Utilisateur } from '../entities/utilisateur.entity';
import { Ceinture } from '../entities/ceinture.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly userRepo: Repository<Utilisateur>,
    @InjectRepository(Ceinture)
    private readonly ceintureRepo: Repository<Ceinture>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private signToken(user: Utilisateur) {
    const token = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') || '7d',
      },
    );
    return { token, userId: user.id, pseudo: user.pseudo };
  }

  async register(dto: RegisterDto) {
    const existant = await this.userRepo.findOne({
      where: [{ pseudo: dto.pseudo }, { email: dto.email }],
    });
    if (existant) {
      throw new ConflictException('Pseudo ou email déjà utilisé');
    }

    // Ceinture par défaut : Blanche
    const ceintureBlanche = await this.ceintureRepo.findOne({
      where: { nom: 'Blanche' },
    });

    const hash = await bcrypt.hash(dto.mot_de_passe, 10);
    const user = this.userRepo.create({
      pseudo: dto.pseudo,
      email: dto.email,
      mot_de_passe: hash,
      barrettes: 0,
      ceinture: ceintureBlanche,
    });
    await this.userRepo.save(user);

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { pseudo: dto.pseudo },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.mot_de_passe, user.mot_de_passe);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return this.signToken(user);
  }
}
