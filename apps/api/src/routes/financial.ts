import type { FastifyInstance } from 'fastify'
import { authenticate, requireRole } from '../middlewares/auth.js'

export default async function financialRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // GET /api/v1/financial/transactions?type=receivable|payable&status=&from=&to=
  app.get('/transactions',       async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.post('/transactions',      async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.patch('/transactions/:id', async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))

  // POST /api/v1/financial/transactions/:id/pay
  app.post('/transactions/:id/pay', async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))

  // GET /api/v1/financial/cashflow?year=&month=
  app.get('/cashflow', async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))

  // GET /api/v1/financial/dre?year=
  app.get('/dre', { preHandler: [requireRole('owner', 'financial')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
