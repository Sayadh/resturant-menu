import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'
import { ImageCropDto } from '../../common/dto/image-crop.dto'

export class ProductImageInputDto {
  /** 800×600 WebP — what guests are served. */
  @IsString()
  url!: string

  /** 1200×900 WebP — retina screens and the detail view. */
  @IsOptional() @IsString()
  hiResUrl?: string

  /** The upload itself, kept so the crop can be redone later. */
  @IsOptional() @IsString()
  originalUrl?: string

  /** 0–100, 50 = centre. Becomes CSS object-position on the public menu. */
  @IsOptional() @IsInt() @Min(0) @Max(100)
  focalX?: number

  @IsOptional() @IsInt() @Min(0) @Max(100)
  focalY?: number

  @IsOptional() @IsObject() @ValidateNested() @Type(() => ImageCropDto)
  crop?: ImageCropDto

  @IsOptional() @IsString()
  storageKey?: string

  @IsOptional() @IsBoolean()
  isMain?: boolean
}
