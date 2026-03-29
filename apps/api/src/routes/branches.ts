import type { FastifyInstance } from 'fastify'
import { authenticate, requireRole } from '../middlewares/auth.js'

export default async function branchRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  app.post('/', { preHandler: [requireRole('owner')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  app.patch('/:id', { preHandler: [requireRole('owner', 'manager')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // GET /api/v1/branches/:id/pdvs
  app.get('/:id/pdvs', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/branches/:id/pdvs  — add PDV terminal
  app.post('/:id/pdvs', { preHandler: [requireRole('owner')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
