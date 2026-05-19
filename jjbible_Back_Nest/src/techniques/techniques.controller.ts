import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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

import { TechniquesService } from './techniques.service';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';
import { SetMaitriseDto } from './dto/set-maitrise.dto';
import { CreateLiaisonDto } from './dto/create-liaison.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Techniques')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('techniques')
export class TechniquesController {
  constructor(private readonly techniquesService: TechniquesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mon pokédex (mes techniques ajoutées)' })
  getMine(@CurrentUser() userId: number) {
    return this.techniquesService.getMine(userId);
  }

  @Get('search')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'scope', required: false, enum: ['all', 'mine', 'public'] })
  @ApiOperation({ summary: 'Rechercher des techniques' })
  search(
    @CurrentUser() userId: number,
    @Query('q') q = '',
    @Query('scope') scope = 'all',
  ) {
    return this.techniquesService.search(userId, q, scope);
  }

  // --- Graphe & liaisons (déclarés AVANT les routes :id) ---

  @Get('graph')
  @ApiOperation({
    summary: 'Graphe complet : tous mes points (techniques) et liaisons',
  })
  getGraph(@CurrentUser() userId: number) {
    return this.techniquesService.getGraph(userId);
  }

  @Get(':id/liaisons')
  @ApiOperation({ summary: 'Liaisons entrantes/sortantes d’une technique' })
  getLiaisons(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.techniquesService.getLiaisons(userId, id);
  }

  @Post(':id/liaisons')
  @ApiOperation({
    summary: 'Lier cette technique à une autre (avant / après)',
  })
  createLiaison(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLiaisonDto,
  ) {
    return this.techniquesService.createLiaison(userId, id, dto);
  }

  @Delete('liaisons/:liaisonId')
  @ApiOperation({ summary: 'Supprimer une liaison' })
  deleteLiaison(
    @CurrentUser() userId: number,
    @Param('liaisonId', ParseIntPipe) liaisonId: number,
  ) {
    return this.techniquesService.deleteLiaison(userId, liaisonId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une technique (ajoutée auto au pokédex)' })
  create(@CurrentUser() userId: number, @Body() dto: CreateTechniqueDto) {
    return this.techniquesService.create(userId, dto);
  }

  @Post(':id/add')
  @ApiOperation({ summary: 'Ajouter une technique existante à mon pokédex' })
  addToPokedex(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.techniquesService.addToPokedex(userId, id);
  }

  @Delete(':id/remove')
  @ApiOperation({ summary: 'Retirer une technique de mon pokédex' })
  removeFromPokedex(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.techniquesService.removeFromPokedex(userId, id);
  }

  @Patch(':id/favori')
  @ApiOperation({ summary: 'Basculer le statut favori' })
  toggleFavori(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.techniquesService.toggleFavori(userId, id);
  }

  @Patch(':id/maitrise')
  @ApiOperation({ summary: 'Définir le niveau de maîtrise' })
  setMaitrise(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetMaitriseDto,
  ) {
    return this.techniquesService.setMaitrise(userId, id, dto.niveau_maitrise);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une de mes techniques' })
  update(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTechniqueDto,
  ) {
    return this.techniquesService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une de mes techniques' })
  remove(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.techniquesService.remove(userId, id);
  }
}
