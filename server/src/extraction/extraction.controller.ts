import { Controller, Post, Body } from '@nestjs/common';
import { ExtractionService } from './extraction.service';

@Controller('extraction')
export class ExtractionController {
  constructor(private readonly extractionService: ExtractionService) { }

  @Post('search')
  search(@Body() body: { params: any }) {
    return this.extractionService.searchCompanies(body.params);
  }

  @Post('extract')
  extract(@Body() body: { params: any; limit: number }) {
    return this.extractionService.extractAndSave(body.params, body.limit || 200);
  }

  @Post('preview')
  preview(@Body() body: { params: any; limit: number }) {
    return this.extractionService.extractAndSave(body.params, body.limit || 50, true);
  }
}
