import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsUUID } from 'class-validator'
import { ListQueryDto } from '../../common/dto/list-query.dto'

export class CategoryListQueryDto extends ListQueryDto {
  @IsOptional() @IsUUID()
  sectionId?: string

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean
}
