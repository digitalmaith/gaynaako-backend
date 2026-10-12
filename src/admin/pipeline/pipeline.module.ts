import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { NotificationService } from './notification.service';
import { MailModule } from '../../common/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [PipelineController],
  providers: [NotificationService],
})
export class PipelineModule {}
