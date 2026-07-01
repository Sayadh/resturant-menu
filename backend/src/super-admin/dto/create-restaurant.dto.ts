import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CreateRestaurantDto {
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase letters, numbers or dashes' })
  @MinLength(2)
  @MaxLength(40)
  slug!: string

  @IsString() @MinLength(1) @MaxLength(120)
  name!: string

  @IsOptional() @IsString()
  themeKey?: string

  @IsOptional() @IsString()
  defaultLang?: string

  @IsOptional() @IsEmail()
  ownerEmail?: string

  @IsOptional() @IsString() @MinLength(6) @MaxLength(72)
  ownerPassword?: string
}
