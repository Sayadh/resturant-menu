import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import { TranslationInputDto } from '../../common/dto/translation-input.dto'

export class CreateCategoryDto {
  @IsUUID()
  sectionId!: string

  @IsOptional() @IsUUID()
  parentId?: string

  @IsOptional() @IsString() @MaxLength(8)
  icon?: string

  @IsOptional() @IsString()
  imageUrl?: string

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number

  @IsOptional() @IsBoolean()
  isActive?: boolean

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TranslationInputDto)
  translations!: TranslationInputDto[]
}
