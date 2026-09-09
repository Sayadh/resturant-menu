import { Global, Module } from '@nestjs/common'
import { PublicCacheService } from './public-cache.service'

/** Global so the public read path and the admin write path share one instance. */
@Global()
@Module({
  providers: [PublicCacheService],
  exports: [PublicCacheService],
})
export class PublicCacheModule {}
