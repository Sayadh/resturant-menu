import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

/**
 * Thin wrapper around PrismaClient. A soft-delete client extension (filtering
 * `deletedAt IS NULL` and turning deletes into updates) will be added here in a
 * later step so every query is protected centrally.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit(): Promise<void> {
    await this.$connect()
    this.logger.log('Prisma connected')
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
