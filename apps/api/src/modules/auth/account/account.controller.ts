import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { AccountService } from './account.service';
import { User, Public } from '@/common/decorators';
import { User as UserEntity } from '@repo/database';
import { CreateUserDto, ChangeEmailDto, ChangePasswordDto } from './dto';

@Controller('auth')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Public()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.accountService.create(createUserDto);
  }

  @Get('profile')
  async me(@User() user: UserEntity) {
    return this.accountService.me(user.id);
  }

  @Put('email')
  async changeEmail(
    @User() user: UserEntity,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    return this.accountService.changeEmail(user, changeEmailDto);
  }

  @Put('password')
  async changePassword(
    @User() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.accountService.changePassword(user, changePasswordDto);
  }
}
