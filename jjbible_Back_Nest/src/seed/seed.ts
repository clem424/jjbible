import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Ceinture } from '../entities/ceinture.entity';
import { Utilisateur } from '../entities/utilisateur.entity';
import { Technique } from '../entities/technique.entity';
import { UtilisateurTechnique } from '../entities/utilisateur-technique.entity';

dotenv.config();

/**
 * Seed initial : remplit la table des ceintures.
 * À lancer une fois après création de la base : `npm run seed`
 */
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Ceinture, Utilisateur, Technique, UtilisateurTechnique],
  charset: 'utf8mb4',
});

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Ceinture);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(
      `✓ La table ceintures contient déjà ${existing} entrées, seed ignoré.`,
    );
    await AppDataSource.destroy();
    return;
  }

  const ceintures: Partial<Ceinture>[] = [
    { nom: 'Blanche', couleur_hex: '#FFFFFF', couleur_secondaire: '#E0E0E0', ordre: 1 },
    { nom: 'Bleue', couleur_hex: '#1E63D6', couleur_secondaire: '#0D47A1', ordre: 2 },
    { nom: 'Violette', couleur_hex: '#6A1B9A', couleur_secondaire: '#4A148C', ordre: 3 },
    { nom: 'Marron', couleur_hex: '#5D4037', couleur_secondaire: '#3E2723', ordre: 4 },
    { nom: 'Noire', couleur_hex: '#212121', couleur_secondaire: '#000000', ordre: 5 },
    { nom: 'Rouge', couleur_hex: '#C62828', couleur_secondaire: '#8E0000', ordre: 6 },
  ];

  await repo.save(ceintures);
  console.log(`✓ ${ceintures.length} ceintures insérées avec succès`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Erreur de seed:', err);
  process.exit(1);
});
