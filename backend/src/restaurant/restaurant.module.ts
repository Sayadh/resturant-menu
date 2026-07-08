import { Module } from '@nestjs/common'
import { RestaurantService } from './restaurant.service'
import { RestaurantController } from './restaurant.controller'
import { UploadsModule } from '../uploads/uploads.module'

@Module({
  imports: [UploadsModule],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
