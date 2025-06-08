import { Router } from 'express'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { CreateParticipantController } from './controllers/participants/CreateParticipantController'
import { ListParticipantsByEventController } from './controllers/participants/ListParticipantsByEventController'
import { TogglePresenceController } from './controllers/participants/TogglePresenceController'

const router = Router()

router.post('/participants', isAuthenticated, new CreateParticipantController().handle)

router.get('/participants', isAuthenticated, new ListParticipantsByEventController().handle)

router.patch('/participants/presence/toggle', isAuthenticated, new TogglePresenceController().handle)

export { router }
