import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middlewares/auth.js'

export default async function dealRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/',                    async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.post('/',                   async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.patch('/:id',               async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.patch('/:id/stage',         async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.delete('/:id',              async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
}
