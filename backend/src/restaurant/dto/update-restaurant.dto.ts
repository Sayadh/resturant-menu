import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export const LANG_CODES = ['hy', 'en', 'ru'] as const
export type LangCode = (typeof LANG_CODES)[number]

/** Per-language tagline, e.g. { hy: "...", en: "...", ru: "..." }. */
export type TaglineInput = Partial<Record<LangCode, string>>

export class UpdateRestaurantDto {
  @IsOptional() @IsString() @MaxLength(120)
  name?: string

  @IsOptional() @IsEmail()
  email?: string

  @IsOptional() @IsString() @MaxLength(300)
  address?: string

  @IsOptional() @IsString() @MaxLength(80)
  workingHours?: string

  @IsOptional() @IsNumber() @Min(0) @Max(5)
  rating?: number

  @IsOptional() @IsString() @MaxLength(8)
  currency?: string

  @IsOptional() @IsString() @MaxLength(64)
  timezone?: string

  @IsOptional() @IsString()
  logoUrl?: string

  @IsOptional() @IsString()
  coverImageUrl?: string

  // Trilingual tagline; persisted in RestaurantTranslation per language.
  @IsOptional() @IsObject()
  tagline?: TaglineInput

  // Enabled languages for the public menu → synced to RestaurantLanguage.
  @IsOptional() @IsArray() @ArrayNotEmpty() @IsIn(LANG_CODES, { each: true })
  activeLanguages?: LangCode[]

  // Fallback / initial language; must be one of the active languages.
  @IsOptional() @IsIn(LANG_CODES)
  defaultLanguage?: LangCode
}
