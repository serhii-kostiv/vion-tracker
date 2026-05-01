import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { Public } from '@/common/decorators';

import { NewPasswordDto } from './dto/new-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordRecoveryService } from './password-recovery.service';

@Controller('auth/password-recovery')
export class PasswordRecoveryController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  @Public()
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Req() req: Request,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.passwordRecoveryService.resetPassword(
      req,
      resetPasswordDto,
      userAgent,
    );
  }

  @Public()
  @Post('new-password')
  @HttpCode(HttpStatus.OK)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.passwordRecoveryService.newPassword(newPasswordDto);
  }
}
