import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { NiveauMaitrise } from '../../entities/utilisateur-technique.entity';

export class SetMaitriseDto {
  @ApiProperty({ enum: ['non_maitrise', 'en_cours', 'maitrise'] })
  @IsIn(['non_maitrise', 'en_cours', 'maitrise'], {
    message: 'Niveau invalide',
  })
  niveau_maitrise!: NiveauMaitrise;
}
