import { ArrayNotEmpty, IsArray, IsIn, IsString, MaxLength, MinLength } from 'class-validator'

const LANGS = ['hy', 'ru', 'en'] as const
export type AiLang = (typeof LANGS)[number]

export class TranslateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string

  @IsIn(LANGS)
  source!: AiLang

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(LANGS, { each: true })
  targets!: AiLang[]
}

export class DescribeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(LANGS, { each: true })
  langs!: AiLang[]
}
