import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false })
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // Behind nginx: trust the first proxy so rate-limiting reads the real client
  // IP from X-Forwarded-For (otherwise every request shares nginx's IP).
  app.set('trust proxy', 1)

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

  // CORS: allow the configured origins (prod domains) + localhost dev + no-origin
  // (curl / same-origin SSR). Production is served same-origin behind nginx.
  const allowed = config.get<string[]>('corsOrigins') ?? []
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowed.includes(origin)) return cb(null, true)
      try {
        const host = new URL(origin).hostname
        if (host === 'localhost' || host === '127.0.0.1') return cb(null, true)
      } catch {
        /* malformed origin → reject below */
      }
      return cb(new Error(`Origin not allowed by CORS: ${origin}`), false)
    },
    credentials: true,
  })

  app.enableShutdownHooks()

  const port = config.get<number>('port') ?? 4000
  await app.listen(port)
  logger.log(`API running on http://localhost:${port}/api/v1`)
}

void bootstrap()
