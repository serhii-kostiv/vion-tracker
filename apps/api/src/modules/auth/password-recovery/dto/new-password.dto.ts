import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class NewPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsUUID('4')
  @IsNotEmpty()
  token!: string;
}
