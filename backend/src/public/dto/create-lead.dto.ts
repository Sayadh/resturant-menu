import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CreateLeadDto {
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  @Matches(/^[+\d\s()-]+$/, { message: 'Invalid phone number' })
  phone!: string

  @IsOptional() @IsString() @MaxLength(80)
  name?: string

  @IsOptional() @IsString() @MaxLength(500)
  message?: string

  @IsOptional() @IsString() @MaxLength(40)
  plan?: string

  // Honeypot — real users leave this empty; bots tend to fill it.
  @IsOptional() @IsString() @MaxLength(0)
  website?: string
}
