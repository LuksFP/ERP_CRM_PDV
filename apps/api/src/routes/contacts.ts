import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middlewares/auth.js'

export default async function contactRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/',      async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.get('/:id',   async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.post('/',     async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.patch('/:id', async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
  app.delete('/:id',async (req, reply) => reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } }))
}
