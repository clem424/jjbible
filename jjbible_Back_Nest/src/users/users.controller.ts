import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ⚠️ Les routes "statiques" sont déclarées AVANT `:id`
  // sinon /users/me serait capté par /users/:id.

  @Get('categories')
  @ApiOperation({ summary: 'Liste des catégories de techniques' })
  getCategories() {
    return this.usersService.getCategories();
  }

  @Get('ceintures')
  @ApiOperation({ summary: 'Référentiel des ceintures' })
  getCeintures() {
    return this.usersService.getCeintures();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil de l’utilisateur connecté' })
  getMe(@CurrentUser() userId: number) {
    return this.usersService.getMe(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour son profil (ceinture, bio, barrettes)' })
  updateMe(@CurrentUser() userId: number, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(userId, dto);
  }

  @Get('search')
  @ApiQuery({ name: 'pseudo', required: false })
  @ApiOperation({ summary: 'Rechercher des utilisateurs par pseudo' })
  search(@Query('pseudo') pseudo = '') {
    return this.usersService.search(pseudo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil public d’un utilisateur + ses techniques visibles' })
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }
}
