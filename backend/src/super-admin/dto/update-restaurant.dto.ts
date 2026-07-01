import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateRestaurantDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  name?: string

  @IsOptional() @IsString()
  themeKey?: string

  @IsOptional() @IsString()
  defaultLang?: string

  @IsOptional() @IsBoolean()
  isActive?: boolean
}
