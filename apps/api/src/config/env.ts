import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:       z.enum(['development', 'production', 'test']).default('development'),
  PORT:           z.coerce.number().default(3000),
  DATABASE_URL:   z.string().min(1),
  JWT_SECRET:     z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS:   z.string().transform((s) => s.split(',')).default('http://localhost:3001,http://localhost:3002'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
