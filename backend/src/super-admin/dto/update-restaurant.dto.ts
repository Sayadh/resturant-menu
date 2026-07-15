import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateRestaurantDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  name?: string

  @IsOptional() @IsString()
  themeKey?: string

  @IsOptional() @IsString()
  defaultLang?: string

  @IsOptional() @IsBoolean()
  isActive?: boolean

  // Subscription plan (super-admin assigns which tier the restaurant is on).
  @IsOptional() @IsIn(['free', 'pro', 'business'])
  planKey?: 'free' | 'pro' | 'business'
}
