import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLiaisonDto {
  @ApiProperty({
    example: 12,
    description: 'Id de l’autre technique à lier',
  })
  @IsInt()
  technique_cible_id!: number;

  @ApiProperty({
    enum: ['avant', 'apres'],
    example: 'apres',
    description:
      "Sens par rapport à la technique de l'URL. " +
      "'apres' = la cible s'enchaîne après ; 'avant' = la cible est avant.",
  })
  @IsIn(['avant', 'apres'])
  sens!: 'avant' | 'apres';

  @ApiPropertyOptional({
    enum: ['enchainement', 'variation', 'contre', 'autre'],
    default: 'enchainement',
  })
  @IsOptional()
  @IsIn(['enchainement', 'variation', 'contre', 'autre'])
  type?: 'enchainement' | 'variation' | 'contre' | 'autre';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
