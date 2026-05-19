import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Santé')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Vérifier que l’API tourne' })
  health() {
    return { message: 'API JJBible OK' };
  }
}
