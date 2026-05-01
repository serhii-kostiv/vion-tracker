import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Headers,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { Public } from '@/common/decorators';

import { LoginDto } from './dto/login.dto';
import { SessionService } from './session.service';

@Controller('auth/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('findByUser')
  async findByUser(@Req() req: Request) {
    return this.sessionService.findByUser(req);
  }

  @Get('findCurrent')
  async findCurrent(@Req() req: Request) {
    return this.sessionService.findCurrent(req);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.sessionService.login(req, loginDto, userAgent);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    return this.sessionService.logout(req);
  }

  @Public()
  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearSession(@Req() req: Request) {
    return this.sessionService.clearSession(req);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.remove(req, id);
  }
}
