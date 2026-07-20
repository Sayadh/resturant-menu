import { Module } from '@nestjs/common'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { PlanLimitsService } from '../common/services/plan-limits.service'

@Module({
  imports: [UploadsModule],
  controllers: [ProductsController],
  providers: [ProductsService, PlanLimitsService],
})
export class ProductsModule {}
