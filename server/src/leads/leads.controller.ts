import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Post('batch')
  createMany(@Body() createLeadDtos: CreateLeadDto[]) {
    return this.leadsService.createMany(createLeadDtos);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.leadsService.findAll(page, limit);
  }

  @Get('trashed')
  findAllTrashed() {
    return this.leadsService.findAllTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.leadsService.restore(id);
  }

  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: string) {
    return this.leadsService.hardDelete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post('batch/delete')
  removeMany(@Body() body: { ids: string[] }) {
    return this.leadsService.removeMany(body.ids);
  }

  @Post('batch/update')
  updateMany(@Body() body: { ids: string[], data: UpdateLeadDto }) {
    return this.leadsService.updateMany(body.ids, body.data);
  }

  @Post('cleanup-duplicates')
  cleanupDuplicates() {
    return this.leadsService.cleanupDuplicates();
  }

  @Post('divide')
  divide(@Body() body: { joaoCount: number, sourceOwner?: 'unassigned' | 'joao' | 'vitor' | 'all' }) {
    return this.leadsService.divideLeads(body.joaoCount, body.sourceOwner);
  }

  // ==================== ANALYTICS ====================

  @Get('stats/overview')
  statsOverview() {
    return this.leadsService.getStatsOverview();
  }

  @Get('stats/funnel')
  statsFunnel() {
    return this.leadsService.getConversionFunnel();
  }

  @Get('stats/timeline')
  statsTimeline(@Query('days') days: number = 30) {
    return this.leadsService.getTimelineStats(Number(days));
  }

  @Get('stats/performance')
  statsPerformance() {
    return this.leadsService.getPerformanceByOwner();
  }

  @Get('stats/geo')
  statsGeo() {
    return this.leadsService.getLeadsByState();
  }

  @Get('stats/salesforce')
  statsSalesForce() {
    return this.leadsService.getSalesForce();
  }
}

