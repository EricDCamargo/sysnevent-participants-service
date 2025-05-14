import { Router } from 'express'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { CreateTicketController } from './controllers/ticket/CreateTicketController'
import { ListTicketsController } from './controllers/ticket/ListTicketsController'
import { DeleteTicketController } from './controllers/ticket/DeleteTicketController'

const router = Router()

router.post('/tickets', isAuthenticated, new CreateTicketController().handle)
router.get('/tickets', isAuthenticated, new ListTicketsController().handle)
router.delete(
  '/tickets/:id',
  isAuthenticated,
  new DeleteTicketController().handle
)

export { router }
