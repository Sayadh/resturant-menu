import { Module } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoriesController } from './categories.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { PlanLimitsService } from '../common/services/plan-limits.service'

@Module({
  imports: [UploadsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, PlanLimitsService],
})
export class CategoriesModule {}
