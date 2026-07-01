import { IsEmail, IsNumber, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

/** Per-language tagline, e.g. { hy: "...", en: "...", ru: "..." }. */
export type TaglineInput = Partial<Record<'hy' | 'en' | 'ru', string>>

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
}
