import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { env } from './config/env.js'

// ── Routes ───────────────────────────────────────────────────────────────────
import authRoutes     from './routes/auth.js'
import tenantRoutes   from './routes/tenants.js'
import productRoutes  from './routes/products.js'
import saleRoutes     from './routes/sales.js'
import userRoutes     from './routes/users.js'
import branchRoutes   from './routes/branches.js'
import contactRoutes  from './routes/contacts.js'
import dealRoutes     from './routes/deals.js'
import financialRoutes from './routes/financial.js'

const app = Fastify({ logger: true })

// ── Plugins ──────────────────────────────────────────────────────────────────
await app.register(cors, {
  origin: env.CORS_ORIGINS,
  credentials: true,
})

await app.register(jwt, {
  secret: env.JWT_SECRET,
})

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

// ── API routes ───────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1'

app.register(authRoutes,      { prefix: `${API_PREFIX}/auth` })
app.register(tenantRoutes,    { prefix: `${API_PREFIX}/tenants` })
app.register(productRoutes,   { prefix: `${API_PREFIX}/products` })
app.register(saleRoutes,      { prefix: `${API_PREFIX}/sales` })
app.register(userRoutes,      { prefix: `${API_PREFIX}/users` })
app.register(branchRoutes,    { prefix: `${API_PREFIX}/branches` })
app.register(contactRoutes,   { prefix: `${API_PREFIX}/contacts` })
app.register(dealRoutes,      { prefix: `${API_PREFIX}/deals` })
app.register(financialRoutes, { prefix: `${API_PREFIX}/financial` })

// ── Start ─────────────────────────────────────────────────────────────────────
try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  console.log(`API running on http://localhost:${env.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
