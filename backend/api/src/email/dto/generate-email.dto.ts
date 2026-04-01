import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GenerateEmailDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cvId?: string;

  @IsString()
  @MinLength(30)
  @MaxLength(20000)
  jobDescription!: string;

  @IsEmail()
  recipientEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  applicantName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  additionalContext?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tone?: string;
}
