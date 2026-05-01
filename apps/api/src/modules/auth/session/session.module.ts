import { Module } from '@nestjs/common';

import { VerificationModule } from '../verification/verification.module';

import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [VerificationModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
