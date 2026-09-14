import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  Max,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import { TranslationInputDto } from '../../common/dto/translation-input.dto'
import { ImageCropDto } from '../../common/dto/image-crop.dto'

export class CreateCategoryDto {
  @IsUUID()
  sectionId!: string

  @IsOptional() @IsUUID()
  parentId?: string

  @IsOptional() @IsString() @MaxLength(8)
  icon?: string

  @IsOptional() @IsString() @MaxLength(500)
  iconUrl?: string

  @IsOptional() @IsString()
  imageUrl?: string

  /** 1200×900 WebP — retina screens and the detail view. */
  @IsOptional() @IsString()
  imageHiResUrl?: string

  /** The upload itself, kept so the crop can be redone later. */
  @IsOptional() @IsString()
  imageOriginalUrl?: string

  /** 0–100, 50 = centre. Becomes CSS object-position on the public menu. */
  @IsOptional() @IsInt() @Min(0) @Max(100)
  imageFocalX?: number

  @IsOptional() @IsInt() @Min(0) @Max(100)
  imageFocalY?: number

  @IsOptional() @IsObject() @ValidateNested() @Type(() => ImageCropDto)
  imageCrop?: ImageCropDto

  @IsOptional() @IsString() @MaxLength(500)
  mobileImageUrl?: string

  // Banner title colour over the image: 'light' (white) or 'dark'.
  @IsOptional() @IsIn(['light', 'dark'])
  bannerTextColor?: 'light' | 'dark'

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
