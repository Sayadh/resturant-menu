import { IsNumber } from 'class-validator'

/**
 * Crop-editor state, stored so the admin can reopen a photo and nudge the
 * framing instead of starting over. Offsets are in image pixels relative to
 * the centre; zoom is 1 = the whole image fits the 4:3 frame.
 */
export class ImageCropDto {
  @IsNumber() offsetX!: number
  @IsNumber() offsetY!: number
  @IsNumber() zoom!: number
}
