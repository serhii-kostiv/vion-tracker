import { Module } from '@nestjs/common';

import { DeactivateController } from './deactivate.controller';
import { DeactivateService } from './deactivate.service';

@Module({
  controllers: [DeactivateController],
  providers: [DeactivateService],
  exports: [DeactivateService],
})
export class DeactivateModule {}
