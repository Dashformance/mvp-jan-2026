import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { SegmentsModule } from './segments/segments.module';
import { ExtractionModule } from './extraction/extraction.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [LeadsModule, SegmentsModule, ExtractionModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
