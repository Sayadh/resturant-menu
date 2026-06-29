import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ProductImageInputDto {
  @IsString()
  url!: string

  @IsOptional() @IsString()
  storageKey?: string

  @IsOptional() @IsBoolean()
  isMain?: boolean
}
