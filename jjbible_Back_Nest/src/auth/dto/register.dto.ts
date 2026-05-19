import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'tatami_master' })
  @IsString()
  @IsNotEmpty({ message: 'Le pseudo est requis' })
  pseudo!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 4 })
  @IsString()
  @MinLength(4, { message: 'Mot de passe trop court' })
  mot_de_passe!: string;
}
