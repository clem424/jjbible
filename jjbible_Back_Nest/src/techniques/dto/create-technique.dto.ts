import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTechniqueDto {
  @ApiProperty({ example: 'Armbar depuis la garde fermée' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://youtu.be/xxxx' })
  @IsOptional()
  @IsString()
  url_video?: string;

  @ApiPropertyOptional({ example: 'Soumission' })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional({ enum: ['publique', 'privee'], default: 'privee' })
  @IsOptional()
  @IsIn(['publique', 'privee'])
  visibilite?: 'publique' | 'privee';
}
