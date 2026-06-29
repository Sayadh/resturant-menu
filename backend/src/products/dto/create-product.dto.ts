import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { TranslationInputDto } from '../../common/dto/translation-input.dto'
import { ProductImageInputDto } from './product-image-input.dto'

export class CreateProductDto {
  @IsUUID()
  categoryId!: string

  @IsInt() @Min(1)
  price!: number

  @IsOptional() @IsInt() @Min(1)
  oldPrice?: number

  @IsOptional() @IsBoolean() isAvailable?: boolean
  @IsOptional() @IsBoolean() isActive?: boolean
  @IsOptional() @IsBoolean() isPopular?: boolean
  @IsOptional() @IsBoolean() isNew?: boolean
  @IsOptional() @IsBoolean() isRecommended?: boolean

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number

  @IsOptional() @IsArray() @IsString({ each: true })
  badges?: string[] // badge keys (system or custom)

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TranslationInputDto)
  translations!: TranslationInputDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[]
}
