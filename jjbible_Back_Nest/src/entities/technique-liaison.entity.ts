import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from './utilisateur.entity';
import { Technique } from './technique.entity';

export type TypeLiaison = 'enchainement' | 'variation' | 'contre' | 'autre';

/**
 * Liaison orientée entre deux techniques : source → cible.
 * Sémantique : "cible s'enchaîne APRÈS source" (donc "source est AVANT cible").
 * Une liaison appartient à un utilisateur (chacun construit son propre "jeu").
 * La contrainte d'unicité empêche les doublons exacts.
 */
@Entity('techniques_liaisons')
@Unique(['utilisateur_id', 'source_id', 'cible_id'])
export class TechniqueLiaison {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 1, description: 'Propriétaire de la liaison' })
  @Column()
  utilisateur_id!: number;

  @ApiProperty({ example: 10, description: 'Technique de départ (avant)' })
  @Column()
  source_id!: number;

  @ApiProperty({ example: 12, description: 'Technique d’arrivée (après)' })
  @Column()
  cible_id!: number;

  @ApiProperty({
    enum: ['enchainement', 'variation', 'contre', 'autre'],
    example: 'enchainement',
  })
  @Column({
    type: 'enum',
    enum: ['enchainement', 'variation', 'contre', 'autre'],
    default: 'enchainement',
  })
  type!: TypeLiaison;

  @ApiProperty({ nullable: true, example: 'Si l’adversaire défend, passer en triangle' })
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ApiProperty()
  @CreateDateColumn()
  date_creation!: Date;

  @ManyToOne(() => Utilisateur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;

  @ManyToOne(() => Technique, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Technique;

  @ManyToOne(() => Technique, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cible_id' })
  cible!: Technique;
}
