import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 2, description: 'Id de la ceinture' })
  @IsOptional()
  @IsInt()
  ceinture_id?: number;

  @ApiPropertyOptional({ example: 'Ma bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 2, description: 'Barrettes (borné entre 0 et 4)' })
  @IsOptional()
  @IsInt()
  barrettes?: number;
}
