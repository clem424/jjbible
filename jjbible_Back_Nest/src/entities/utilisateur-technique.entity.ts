import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from './utilisateur.entity';
import { Technique } from './technique.entity';

export type NiveauMaitrise = 'non_maitrise' | 'en_cours' | 'maitrise';

/**
 * Table de liaison (le "pokédex" d'un utilisateur).
 * Clé primaire composite (utilisateur_id, technique_id).
 */
@Entity('utilisateurs_techniques')
export class UtilisateurTechnique {
  @PrimaryColumn()
  utilisateur_id!: number;

  @PrimaryColumn()
  technique_id!: number;

  @ManyToOne(() => Utilisateur, (user) => user.pokedex, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;

  @ManyToOne(() => Technique, (t) => t.ajouts, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'technique_id' })
  technique!: Technique;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  favori!: boolean;

  @ApiProperty({ enum: ['non_maitrise', 'en_cours', 'maitrise'], example: 'en_cours' })
  @Column({
    type: 'enum',
    enum: ['non_maitrise', 'en_cours', 'maitrise'],
    default: 'non_maitrise',
  })
  niveau_maitrise!: NiveauMaitrise;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes_personnelles!: string | null;

  @ApiProperty()
  @CreateDateColumn()
  date_ajout!: Date;
}
