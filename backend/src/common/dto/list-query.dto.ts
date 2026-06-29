import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class ListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500)
  pageSize = 20

  @IsOptional() @IsString()
  sort?: string // "sortOrder:asc"

  @IsOptional() @IsString()
  search?: string
}
