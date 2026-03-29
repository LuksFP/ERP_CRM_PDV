import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middlewares/auth.js'

export default async function saleRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // GET /api/v1/sales?page=&status=&from=&to=
  app.get('/', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // GET /api/v1/sales/:id
  app.get('/:id', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/sales  — opens a new sale
  app.post('/', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/sales/:id/complete
  app.post('/:id/complete', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/sales/:id/cancel
  app.post('/:id/cancel', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
