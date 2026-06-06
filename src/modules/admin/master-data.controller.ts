import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MasterDataService } from './master-data.service';

type MasterResource = 'skills' | 'industries' | 'languages' | 'universities' | 'majors';

type MasterDataBody = {
  name: string;
  isActive?: boolean;
};

@Controller('admin/master-data')
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get(':resource')
  list(@Param('resource') resource: MasterResource) {
    return this.masterDataService.list(resource);
  }

  @Post(':resource')
  create(@Param('resource') resource: MasterResource, @Body() body: MasterDataBody) {
    return this.masterDataService.create(resource, body.name, body.isActive ?? true);
  }

  @Patch(':resource/:id')
  update(
    @Param('resource') resource: MasterResource,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<MasterDataBody>,
  ) {
    return this.masterDataService.update(resource, id, body);
  }

  @Delete(':resource/:id')
  remove(
    @Param('resource') resource: MasterResource,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.masterDataService.remove(resource, id);
  }
}