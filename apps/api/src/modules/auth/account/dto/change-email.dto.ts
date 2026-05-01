import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
