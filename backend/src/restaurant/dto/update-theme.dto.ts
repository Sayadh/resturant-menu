import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateThemeDto {
  // The human theme key (e.g. 'aria', 'maison'); resolved to the Theme id server-side.
  @IsString()
  @IsNotEmpty()
  themeKey!: string
}
