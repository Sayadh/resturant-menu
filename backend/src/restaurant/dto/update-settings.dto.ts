import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator'

const HEX = /^#([0-9a-fA-F]{6})$/

export class UpdateSettingsDto {
  @IsOptional() @Matches(HEX) primaryColor?: string
  @IsOptional() @Matches(HEX) secondaryColor?: string
  @IsOptional() @Matches(HEX) backgroundColor?: string
  @IsOptional() @Matches(HEX) accentColor?: string

  @IsOptional() @IsString() fontFamily?: string
  @IsOptional() @IsInt() @Min(0) @Max(40) cardRadius?: number

  @IsOptional() @IsBoolean() showRating?: boolean
  @IsOptional() @IsBoolean() showBasket?: boolean
  @IsOptional() @IsBoolean() showFavorites?: boolean
  @IsOptional() @IsBoolean() showProductDescriptions?: boolean
  @IsOptional() @IsBoolean() animationsEnabled?: boolean

  @IsOptional() @IsString() instagramUrl?: string
  @IsOptional() @IsString() facebookUrl?: string
  @IsOptional() @IsString() websiteUrl?: string
}
