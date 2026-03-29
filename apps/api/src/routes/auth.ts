import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
// import { AuthController } from '../controllers/auth.js'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

export default async function authRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/login
  app.post('/login', async (req, reply) => {
    // TODO: implement AuthController.login
    // const body = loginSchema.parse(req.body)
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/auth/refresh
  app.post('/refresh', async (req, reply) => {
    // TODO: implement AuthController.refresh
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })

  // POST /api/v1/auth/logout
  app.post('/logout', async (req, reply) => {
    // TODO: invalidate refresh token
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'TODO' } })
  })
}
