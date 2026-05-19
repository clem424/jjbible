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
import { Ceinture } from './ceinture.entity';
import { Technique } from './technique.entity';
import { UtilisateurTechnique } from './utilisateur-technique.entity';

@Entity('utilisateurs')
export class Utilisateur {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'tatami_master' })
  @Column({ type: 'varchar', length: 50, unique: true })
  pseudo!: string;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  // Jamais renvoyé au client (hash bcrypt)
  @Column({ type: 'varchar', length: 255 })
  mot_de_passe!: string;

  @ApiProperty({ nullable: true, example: 'Compétiteur depuis 2019' })
  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: 0, description: 'Barrettes sur la ceinture (0 à 4)' })
  @Column({ type: 'tinyint', default: 0 })
  barrettes!: number;

  @ApiProperty()
  @CreateDateColumn()
  date_creation!: Date;

  @ManyToOne(() => Ceinture, (ceinture) => ceinture.utilisateurs, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'ceinture_id' })
  ceinture!: Ceinture | null;

  @OneToMany(() => Technique, (t) => t.createur)
  techniques_creees!: Technique[];

  @OneToMany(() => UtilisateurTechnique, (ut) => ut.utilisateur)
  pokedex!: UtilisateurTechnique[];
}
