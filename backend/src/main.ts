import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false })
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // /api/v1/...  (global prefix + URI versioning)
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v', defaultVersion: '1' })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
  })

  app.enableShutdownHooks()

  const port = config.get<number>('port') ?? 4000
  await app.listen(port)
  logger.log(`API running on http://localhost:${port}/api/v1`)
}

void bootstrap()
