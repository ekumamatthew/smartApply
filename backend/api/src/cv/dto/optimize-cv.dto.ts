import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const CV_STANDARDS = [
  'ats',
  'modern',
  'executive',
  'academic',
  'general',
] as const;
export type CvStandard = (typeof CV_STANDARDS)[number];

export class OptimizeCvDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cvId?: string;

  @IsString()
  @MinLength(30)
  @MaxLength(20000)
  jobDescription!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  templateId?: string;

  @IsOptional()
  @IsIn(CV_STANDARDS)
  standard?: CvStandard;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  clientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  clientPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  clientLocation?: string;
}
