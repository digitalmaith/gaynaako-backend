import { Module } from '@nestjs/common';
import { SourcesScrapingController } from './sources-scraping.controller';
import { SourcesScrapingService } from './sources-scraping.service';
import { SourceScrapingRepository } from './repositories/source-scraping.repository';
import { JournalRepository } from '../repositories/journal.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SourcesScrapingController],
  providers: [SourcesScrapingService, SourceScrapingRepository, JournalRepository],
  exports: [SourcesScrapingService],
})
export class SourcesScrapingModule {}
