import { Transform } from 'class-transformer'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

/** GET /public/restaurants/:id/search?q=&lang= */
export class SearchMenuDto {
  // Trimmed here so "  cola " and "cola" are the same search. Fewer than two
  // characters is not an error — the service simply returns nothing.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(64)
  q!: string

  /** Language the guest is reading in — only used to break ranking ties. */
  @IsOptional()
  @IsIn(['hy', 'en', 'ru'])
  lang?: string
}
