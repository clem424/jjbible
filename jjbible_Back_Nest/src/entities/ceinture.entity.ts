import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from './utilisateur.entity';

/**
 * Référentiel des ceintures de JJB.
 * Crée la table `ceintures`.
 */
@Entity('ceintures')
export class Ceinture {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Bleue' })
  @Column({ length: 50, unique: true })
  nom!: string;

  @ApiProperty({ example: '#1E63D6', description: 'Couleur principale (hex)' })
  @Column({ length: 7 })
  couleur_hex!: string;

  @ApiProperty({ example: '#0D47A1', nullable: true, description: 'Couleur secondaire (dégradé)' })
  @Column({ length: 7, nullable: true })
  couleur_secondaire!: string;

  @ApiProperty({ example: 2, description: 'Ordre de progression (1 = blanche, 6 = rouge)' })
  @Column()
  ordre!: number;

  @OneToMany(() => Utilisateur, (user) => user.ceinture)
  utilisateurs!: Utilisateur[];
}
