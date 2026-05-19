import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Utilisateur } from '../entities/utilisateur.entity';
import { Ceinture } from '../entities/ceinture.entity';
import { UtilisateurTechnique } from '../entities/utilisateur-technique.entity';
import { UpdateMeDto } from './dto/update-me.dto';
import { formatUser } from './format';

export const CATEGORIES = [
  'Soumission',
  'Étranglement',
  'Clé articulaire',
  'Balayage',
  'Passage de garde',
  'Garde',
  'Renversement',
  'Échappée',
  'Takedown',
  'Position dominante',
  'Transition',
  'Defense',
  'Drill',
  'Autre',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly userRepo: Repository<Utilisateur>,
    @InjectRepository(Ceinture)
    private readonly ceintureRepo: Repository<Ceinture>,
    @InjectRepository(UtilisateurTechnique)
    private readonly liaisonRepo: Repository<UtilisateurTechnique>,
  ) {}

  getCategories() {
    return CATEGORIES;
  }

  getCeintures() {
    return this.ceintureRepo.find({ order: { ordre: 'ASC' } });
  }

  async getMe(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return formatUser(user, true);
  }

  async updateMe(userId: number, dto: UpdateMeDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (dto.ceinture_id !== undefined) {
      const ceinture = await this.ceintureRepo.findOne({
        where: { id: dto.ceinture_id },
      });
      if (ceinture) user.ceinture = ceinture;
    }
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.barrettes !== undefined) {
      user.barrettes = Math.max(0, Math.min(4, Number(dto.barrettes)));
    }

    await this.userRepo.save(user);
    return formatUser(user, true);
  }

  async search(pseudo: string) {
    if (!pseudo) return [];
    const users = await this.userRepo.find({
      where: { pseudo: Like(`%${pseudo}%`) },
      take: 20,
    });
    return users.map((u) => formatUser(u));
  }

  async getProfile(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const liaisons = await this.liaisonRepo.find({
      where: { utilisateur_id: id },
      order: { favori: 'DESC', date_ajout: 'DESC' },
    });

    const techniques = liaisons
      .filter(
        (l) =>
          l.technique &&
          (l.technique.visibilite === 'publique' ||
            l.technique.createur_id === id),
      )
      .map((l) => ({
        ...l.technique,
        favori: l.favori,
        niveau_maitrise: l.niveau_maitrise,
        notes_personnelles: l.notes_personnelles,
      }));

    return { ...formatUser(user), techniques };
  }
}
