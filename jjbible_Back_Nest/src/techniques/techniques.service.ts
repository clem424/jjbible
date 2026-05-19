import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Technique,
  Plateforme,
} from '../entities/technique.entity';
import {
  UtilisateurTechnique,
  NiveauMaitrise,
} from '../entities/utilisateur-technique.entity';
import { TechniqueLiaison } from '../entities/technique-liaison.entity';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';
import { CreateLiaisonDto } from './dto/create-liaison.dto';

function detectPlateforme(url: string | null | undefined): Plateforme {
  if (!url) return 'autre';
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  return 'autre';
}

/**
 * Sérialise une liaison user-technique pour le frontend :
 * on aplatit la relation Technique + on ajoute les métadonnées du pokédex.
 */
function serializeLiaison(l: UtilisateurTechnique) {
  if (!l.technique) return null;
  return {
    ...l.technique,
    favori: l.favori,
    niveau_maitrise: l.niveau_maitrise,
    notes_personnelles: l.notes_personnelles,
    date_ajout: l.date_ajout,
  };
}

@Injectable()
export class TechniquesService {
  constructor(
    @InjectRepository(Technique)
    private readonly techRepo: Repository<Technique>,
    @InjectRepository(UtilisateurTechnique)
    private readonly liaisonRepo: Repository<UtilisateurTechnique>,
    @InjectRepository(TechniqueLiaison)
    private readonly lienRepo: Repository<TechniqueLiaison>,
  ) {}

  async getMine(userId: number) {
    const liaisons = await this.liaisonRepo.find({
      where: { utilisateur_id: userId },
      order: { favori: 'DESC', date_ajout: 'DESC' },
    });
    return liaisons.map(serializeLiaison).filter(Boolean);
  }

  async search(userId: number, q: string, scope: string) {
    const search = `%${(q || '').trim()}%`;

    if (scope === 'mine') {
      const liaisons = await this.liaisonRepo
        .createQueryBuilder('ut')
        .innerJoinAndSelect('ut.technique', 't')
        .where('ut.utilisateur_id = :uid', { uid: userId })
        .andWhere('(t.nom LIKE :s OR t.categorie LIKE :s)', { s: search })
        .orderBy('t.nom', 'ASC')
        .getMany();
      return liaisons.map(serializeLiaison).filter(Boolean);
    }

    let qb = this.techRepo
      .createQueryBuilder('t')
      .where('(t.nom LIKE :s OR t.categorie LIKE :s)', { s: search });

    if (scope === 'public') {
      qb = qb.andWhere(`t.visibilite = 'publique'`);
    } else {
      qb = qb.andWhere(
        `(t.visibilite = 'publique' OR t.createur_id = :uid)`,
        { uid: userId },
      );
    }

    return qb.orderBy('t.nom', 'ASC').take(50).getMany();
  }

  async create(userId: number, dto: CreateTechniqueDto) {
    const tech = this.techRepo.create({
      nom: dto.nom,
      description: dto.description || null,
      url_video: dto.url_video || null,
      plateforme: detectPlateforme(dto.url_video),
      categorie: dto.categorie || null,
      createur_id: userId,
      visibilite: dto.visibilite || 'privee',
    });
    await this.techRepo.save(tech);

    // Ajout automatique au pokédex du créateur
    const liaison = this.liaisonRepo.create({
      utilisateur_id: userId,
      technique_id: tech.id,
    });
    await this.liaisonRepo.save(liaison);

    return tech;
  }

  async addToPokedex(userId: number, id: number) {
    const tech = await this.techRepo.findOne({ where: { id } });
    if (!tech) throw new NotFoundException('Technique introuvable');

    const accessible =
      tech.visibilite === 'publique' || tech.createur_id === userId;
    if (!accessible) throw new ForbiddenException('Technique inaccessible');

    const existing = await this.liaisonRepo.findOne({
      where: { utilisateur_id: userId, technique_id: id },
    });
    if (existing) return { message: 'Déjà dans ton pokédex' };

    const liaison = this.liaisonRepo.create({
      utilisateur_id: userId,
      technique_id: id,
    });
    await this.liaisonRepo.save(liaison);
    return { message: 'Technique ajoutée à ton pokédex' };
  }

  async removeFromPokedex(userId: number, id: number) {
    await this.liaisonRepo.delete({
      utilisateur_id: userId,
      technique_id: id,
    });
    return { message: 'Technique retirée de ton pokédex' };
  }

  async toggleFavori(userId: number, id: number) {
    const liaison = await this.liaisonRepo.findOne({
      where: { utilisateur_id: userId, technique_id: id },
    });
    if (!liaison) throw new NotFoundException('Pas dans ton pokédex');

    liaison.favori = !liaison.favori;
    await this.liaisonRepo.save(liaison);
    return { favori: liaison.favori };
  }

  async setMaitrise(userId: number, id: number, niveau: NiveauMaitrise) {
    if (!['non_maitrise', 'en_cours', 'maitrise'].includes(niveau)) {
      throw new BadRequestException('Niveau invalide');
    }
    const liaison = await this.liaisonRepo.findOne({
      where: { utilisateur_id: userId, technique_id: id },
    });
    if (!liaison) throw new NotFoundException('Pas dans ton pokédex');

    liaison.niveau_maitrise = niveau;
    await this.liaisonRepo.save(liaison);
    return { niveau_maitrise: niveau };
  }

  async update(userId: number, id: number, dto: UpdateTechniqueDto) {
    const tech = await this.techRepo.findOne({ where: { id } });
    if (!tech) throw new NotFoundException('Introuvable');
    if (tech.createur_id !== userId) {
      throw new ForbiddenException('Non autorisé');
    }

    tech.nom = dto.nom as string;
    tech.description = (dto.description as string) ?? null;
    tech.url_video = (dto.url_video as string) ?? null;
    tech.plateforme = detectPlateforme(dto.url_video);
    tech.categorie = (dto.categorie as string) ?? null;
    tech.visibilite = (dto.visibilite as 'publique' | 'privee') ?? tech.visibilite;
    await this.techRepo.save(tech);
    return tech;
  }

  async remove(userId: number, id: number) {
    const tech = await this.techRepo.findOne({ where: { id } });
    if (!tech) throw new NotFoundException('Introuvable');
    if (tech.createur_id !== userId) {
      throw new ForbiddenException('Non autorisé');
    }
    await this.techRepo.remove(tech);
    return { message: 'Technique supprimée' };
  }

  // ==========================================================================
  //  LIAISONS entre techniques (graphe d'enchaînements, propre à l'utilisateur)
  // ==========================================================================

  /** Vérifie qu'une technique est accessible par l'utilisateur */
  private async assertAccessible(userId: number, techId: number) {
    const t = await this.techRepo.findOne({ where: { id: techId } });
    if (!t) throw new NotFoundException(`Technique ${techId} introuvable`);
    const ok = t.visibilite === 'publique' || t.createur_id === userId;
    if (!ok) throw new ForbiddenException(`Technique ${techId} inaccessible`);
    return t;
  }

  /**
   * Crée une liaison orientée. `sens` est relatif à la technique de l'URL :
   *  - 'apres' : techId  →  cible   (la cible s'enchaîne APRÈS)
   *  - 'avant' : cible    →  techId (la cible est AVANT)
   */
  async createLiaison(userId: number, techId: number, dto: CreateLiaisonDto) {
    if (techId === dto.technique_cible_id) {
      throw new BadRequestException(
        'Une technique ne peut pas être liée à elle-même',
      );
    }
    await this.assertAccessible(userId, techId);
    await this.assertAccessible(userId, dto.technique_cible_id);

    const source_id =
      dto.sens === 'apres' ? techId : dto.technique_cible_id;
    const cible_id =
      dto.sens === 'apres' ? dto.technique_cible_id : techId;

    const existing = await this.lienRepo.findOne({
      where: { utilisateur_id: userId, source_id, cible_id },
    });
    if (existing) {
      throw new BadRequestException('Cette liaison existe déjà');
    }

    const lien = this.lienRepo.create({
      utilisateur_id: userId,
      source_id,
      cible_id,
      type: dto.type || 'enchainement',
      note: dto.note || null,
    });
    await this.lienRepo.save(lien);
    return lien;
  }

  /** Liaisons (entrantes + sortantes) qui touchent une technique donnée */
  async getLiaisons(userId: number, techId: number) {
    const liens = await this.lienRepo.find({
      where: [
        { utilisateur_id: userId, source_id: techId },
        { utilisateur_id: userId, cible_id: techId },
      ],
      order: { date_creation: 'ASC' },
    });
    return liens;
  }

  async deleteLiaison(userId: number, liaisonId: number) {
    const lien = await this.lienRepo.findOne({
      where: { id: liaisonId },
    });
    if (!lien) throw new NotFoundException('Liaison introuvable');
    if (lien.utilisateur_id !== userId) {
      throw new ForbiddenException('Non autorisé');
    }
    await this.lienRepo.remove(lien);
    return { message: 'Liaison supprimée' };
  }

  /**
   * Graphe complet de l'utilisateur :
   *  - nodes : toutes les techniques de son pokédex
   *  - edges : toutes ses liaisons
   * Format prêt à être consommé par Cytoscape côté frontend.
   */
  async getGraph(userId: number) {
    const liaisons = await this.liaisonRepo.find({
      where: { utilisateur_id: userId },
    });

    const nodes = liaisons
      .filter((l) => l.technique)
      .map((l) => ({
        id: l.technique.id,
        nom: l.technique.nom,
        categorie: l.technique.categorie,
        niveau_maitrise: l.niveau_maitrise,
        favori: l.favori,
      }));

    const liens = await this.lienRepo.find({
      where: { utilisateur_id: userId },
      order: { date_creation: 'ASC' },
    });

    const edges = liens.map((e) => ({
      id: e.id,
      source: e.source_id,
      cible: e.cible_id,
      type: e.type,
      note: e.note,
    }));

    return { nodes, edges };
  }
}
