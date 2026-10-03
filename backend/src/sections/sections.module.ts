import { Module } from '@nestjs/common'
import { SectionsService } from './sections.service'
import { SectionsController } from './sections.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { PlanLimitsService } from '../common/services/plan-limits.service'

@Module({
  imports: [UploadsModule],
  controllers: [SectionsController],
  providers: [SectionsService, PlanLimitsService],
})
export class SectionsModule {}
