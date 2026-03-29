import type { FastifyInstance } from 'fastify'
import { authenticate, requireRole } from '../middlewares/auth.js'

export default async function userRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // GET /api/v1/users
  app.get('/', { preHandler: [requireRole('owner', 'manager')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/users  — invite user
  app.post('/', { preHandler: [requireRole('owner', 'manager')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // PATCH /api/v1/users/:id
  app.patch('/:id', { preHandler: [requireRole('owner', 'manager')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // DELETE /api/v1/users/:id
  app.delete('/:id', { preHandler: [requireRole('owner')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
