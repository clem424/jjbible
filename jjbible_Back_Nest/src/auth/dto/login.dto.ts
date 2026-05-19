import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'tatami_master' })
  @IsString()
  @IsNotEmpty({ message: 'Pseudo requis' })
  pseudo!: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @IsNotEmpty({ message: 'Mot de passe requis' })
  mot_de_passe!: string;
}
