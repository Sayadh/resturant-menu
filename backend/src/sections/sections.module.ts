import { Module } from '@nestjs/common'
import { SectionsService } from './sections.service'
import { SectionsController } from './sections.controller'
import { UploadsModule } from '../uploads/uploads.module'

@Module({
  imports: [UploadsModule],
  controllers: [SectionsController],
  providers: [SectionsService],
})
export class SectionsModule {}
