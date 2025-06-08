import { Role } from '../types'
declare global {
  namespace Express {
    interface Request {
      user_id: string
      user_role: Role
    }
  }
}
