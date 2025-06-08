import { Request, NextFunction, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { Role } from '../@types/types'

interface Payload {
  sub: string
  role: Role
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers.authorization

  if (!authToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Token não encontrado!' })
      .end()
  }

  const [, token] = authToken.split(' ')

  try {
    const { sub, role } = verify(
      token,
      process.env.JWT_SECRET as string
    ) as Payload

    req.user_id = sub
    req.user_role = role

    return next()
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Token invalido ou expirado!' })
      .end()
  }
}

export function isCoordinator(req: Request, res: Response, next: NextFunction) {
  if (req.user_role !== Role.COORDINATOR && req.user_role !== Role.ADMIN) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Permisão negada!' })
  }

  return next()
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user_role !== Role.ADMIN) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Permisão negada!' })
  }

  return next()
}
