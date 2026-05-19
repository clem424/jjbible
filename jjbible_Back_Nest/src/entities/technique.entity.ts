import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from './utilisateur.entity';
import { UtilisateurTechnique } from './utilisateur-technique.entity';

export type Plateforme = 'youtube' | 'tiktok' | 'instagram' | 'autre';
export type Visibilite = 'publique' | 'privee';

@Entity('techniques')
export class Technique {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Triangle depuis la garde fermée' })
  @Column({ type: 'varchar', length: 150 })
  nom!: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true, example: 'https://youtu.be/xxxx' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  url_video!: string | null;

  @ApiProperty({ enum: ['youtube', 'tiktok', 'instagram', 'autre'], example: 'youtube' })
  @Column({
    type: 'enum',
    enum: ['youtube', 'tiktok', 'instagram', 'autre'],
    default: 'autre',
  })
  plateforme!: Plateforme;

  @ApiProperty({ nullable: true, example: 'Soumission' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  categorie!: string | null;

  @ManyToOne(() => Utilisateur, (user) => user.techniques_creees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'createur_id' })
  createur!: Utilisateur;

  @ApiProperty({ example: 1 })
  @Column()
  createur_id!: number;

  @ApiProperty({ enum: ['publique', 'privee'], example: 'privee' })
  @Column({
    type: 'enum',
    enum: ['publique', 'privee'],
    default: 'privee',
  })
  visibilite!: Visibilite;

  @ApiProperty()
  @CreateDateColumn()
  date_creation!: Date;

  @OneToMany(() => UtilisateurTechnique, (ut) => ut.technique)
  ajouts!: UtilisateurTechnique[];
}
