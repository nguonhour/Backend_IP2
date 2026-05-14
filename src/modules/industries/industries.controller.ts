import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { IndustriesService } from './industries.service';

@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Get()
  async getIndustries() {
    return this.industriesService.getIndustries();
  }

  @Get(':id')
  async getIndustryById(@Param('id', ParseUUIDPipe) id: string) {
    return this.industriesService.getIndustryById(id);
  }
}
