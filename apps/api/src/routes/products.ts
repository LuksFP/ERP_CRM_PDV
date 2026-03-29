import type { FastifyInstance } from 'fastify'
import { authenticate, getTenantId } from '../middlewares/auth.js'

export default async function productRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', authenticate)

  // GET /api/v1/products?page=1&perPage=50&search=&categoryId=&lowStock=
  app.get('/', async (req, reply) => {
    const tenantId = getTenantId(req)
    // TODO: ProductController.list(tenantId, query)
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // GET /api/v1/products/:id
  app.get('/:id', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/products
  app.post('/', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // PATCH /api/v1/products/:id
  app.patch('/:id', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // DELETE /api/v1/products/:id
  app.delete('/:id', async (req, reply) => {
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/products/:id/stock-movement
  app.post('/:id/stock-movement', async (req, reply) => {
    // Entrada / saída / ajuste de estoque
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
