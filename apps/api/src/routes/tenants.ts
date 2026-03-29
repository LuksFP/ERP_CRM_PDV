import type { FastifyInstance } from 'fastify'
import { authenticate, requireRole } from '../middlewares/auth.js'

export default async function tenantRoutes(app: FastifyInstance) {
  // Admin-only routes (superadmin / support)
  app.addHook('preHandler', authenticate)

  // GET /api/v1/tenants?page=&search=&plan=&status=
  app.get('/', { preHandler: [requireRole('superadmin', 'support', 'sales')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // GET /api/v1/tenants/:id
  app.get('/:id', { preHandler: [requireRole('superadmin', 'support')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/tenants  — create new tenant (wizard)
  app.post('/', { preHandler: [requireRole('superadmin', 'sales')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // PATCH /api/v1/tenants/:id
  app.patch('/:id', { preHandler: [requireRole('superadmin')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/tenants/:id/suspend
  app.post('/:id/suspend', { preHandler: [requireRole('superadmin')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/tenants/:id/impersonate  — admin impersonates a tenant user
  app.post('/:id/impersonate', { preHandler: [requireRole('superadmin', 'support')] }, async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
