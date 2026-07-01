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

  // CORS: allow the configured origins exactly, plus any Vercel deployment of
  // this project (preview URLs change on every deploy), plus no-origin (curl/SSR).
  const allowed = config.get<string[]>('corsOrigins') ?? []
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowed.includes(origin)) return cb(null, true)
      try {
        const host = new URL(origin).hostname
        if (host.endsWith('.vercel.app') && host.startsWith('resturant-menu')) {
          return cb(null, true)
        }
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
