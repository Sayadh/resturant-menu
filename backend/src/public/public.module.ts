import { Module } from '@nestjs/common'
import { PublicService } from './public.service'
import { PublicController } from './public.controller'
import { LeadService } from './lead.service'

@Module({
  controllers: [PublicController],
  providers: [PublicService, LeadService],
})
export class PublicModule {}
