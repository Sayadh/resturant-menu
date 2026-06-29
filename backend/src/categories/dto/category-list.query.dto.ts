import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional } from 'class-validator'
import { SectionType } from '@prisma/client'
import { ListQueryDto } from '../../common/dto/list-query.dto'

export class CategoryListQueryDto extends ListQueryDto {
  @IsOptional() @IsEnum(SectionType)
  section?: SectionType

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean
}
