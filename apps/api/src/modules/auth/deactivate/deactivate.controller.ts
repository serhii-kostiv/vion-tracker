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

import { User } from '@/common/decorators';
import { User as UserEntity } from '@repo/database';

import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeactivateService } from './deactivate.service';

@Controller('auth/deactivate')
export class DeactivateController {
  constructor(private readonly deactivateService: DeactivateService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @Req() req: Request,
    @Body() deactivateAccountDto: DeactivateAccountDto,
    @User() user: UserEntity,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.deactivateService.deactivate(
      req,
      deactivateAccountDto,
      user,
      userAgent,
    );
  }
}
