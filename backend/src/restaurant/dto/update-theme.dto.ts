import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateThemeDto {
  @IsString()
  @IsNotEmpty()
  themeId!: string
}
