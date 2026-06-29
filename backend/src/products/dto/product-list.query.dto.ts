import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { SectionType } from '@prisma/client'
import { ListQueryDto } from '../../common/dto/list-query.dto'

export class ProductListQueryDto extends ListQueryDto {
  @IsOptional() @IsUUID()
  categoryId?: string

  @IsOptional() @IsEnum(SectionType)
  section?: SectionType

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isAvailable?: boolean
}
