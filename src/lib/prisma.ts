import { PrismaClient } from '@prisma/client'

// グローバル変数としてPrismaClientを保存するためのオブジェクト
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  }

// 既存のインスタンスがあればそれを使用し、なければ新しく作成
export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

// 開発環境の場合のみグローバル変数にインスタンスを保存
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 