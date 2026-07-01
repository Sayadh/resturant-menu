import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'

import configuration from './config/configuration'
import { envValidationSchema } from './config/env.validation'
import { PrismaModule } from './prisma/prisma.module'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { RestaurantModule } from './restaurant/restaurant.module'
import { PublicModule } from './public/public.module'
import { SectionsModule } from './sections/sections.module'
import { CategoriesModule } from './categories/categories.module'
import { ProductsModule } from './products/products.module'
import { SuperAdminModule } from './super-admin/super-admin.module'

import { RequestContextMiddleware } from './common/context/request-context.middleware'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: config.get<string>('jwt.accessExpiresIn') },
      }),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    RestaurantModule,
    PublicModule,
    SectionsModule,
    CategoriesModule,
    ProductsModule,
    SuperAdminModule,
    // Step 6+: Uploads, audit, analytics ...
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Global auth chain: authenticate, then enforce roles. Tenant scope is
    // applied per-controller via @UseGuards(RestaurantScopeGuard).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*')
  }
}
