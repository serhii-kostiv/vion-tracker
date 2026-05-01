import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class DeactivateAccountDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public password!: string;

  @IsString()
  @IsOptional()
  @Length(6, 6)
  public pin?: string;
}
