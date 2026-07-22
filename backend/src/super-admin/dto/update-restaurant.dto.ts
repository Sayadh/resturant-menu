import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

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

  // Contact info managed from the super-admin panel.
  @IsOptional() @IsString() @MaxLength(300)
  address?: string

  @IsOptional() @IsString() @MaxLength(40)
  phone?: string

  // Owner login credentials (super-admin can change the email / reset password).
  @IsOptional() @IsEmail()
  ownerEmail?: string

  @IsOptional() @IsString() @MinLength(6) @MaxLength(72)
  ownerPassword?: string
}
