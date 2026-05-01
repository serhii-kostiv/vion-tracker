import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import { Request } from 'express';

import { Public } from '@/common/decorators';

import { VerificationDto } from './dto/verification.dto';
import { VerificationService } from './verification.service';

@Controller('auth')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Public()
  @Post('verify')
  async verify(
    @Req() req: Request,
    @Body() verificationDto: VerificationDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.verificationService.verify(req, verificationDto, userAgent);
  }
}
