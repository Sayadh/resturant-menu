import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { MeController } from './me.controller'

@Module({
  controllers: [AuthController, MeController],
  providers: [AuthService],
})
export class AuthModule {}
