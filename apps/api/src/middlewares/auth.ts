import type { FastifyRequest, FastifyReply } from 'fastify'

export interface JwtPayload {
  sub: string          // userId
  tenantId: string
  role: string
  iat: number
  exp: number
}

/** Verifies JWT and attaches user to request */
export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({
      error: { code: 'UNAUTHORIZED', message: 'Token inválido ou expirado.' },
    })
  }
}

/** Requires minimum role level — usage: requireRole('manager') */
export function requireRole(...allowedRoles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as JwtPayload
    if (!allowedRoles.includes(user.role)) {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'Sem permissão para esta ação.' },
      })
    }
  }
}

/** Extracts tenantId from JWT — used in all tenant-scoped queries */
export function getTenantId(req: FastifyRequest): string {
  return (req.user as JwtPayload).tenantId
}
