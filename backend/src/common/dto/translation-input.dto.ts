import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class TranslationInputDto {
  @IsString() @MinLength(2) @MaxLength(8)
  languageCode!: string

  @IsString() @MinLength(1) @MaxLength(160)
  name!: string

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string
}
