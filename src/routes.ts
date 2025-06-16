import { Router } from 'express'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { CreateParticipantController } from './controllers/participants/CreateParticipantController'
import { ListParticipantsByEventController } from './controllers/participants/ListParticipantsByEventController'
import { TogglePresenceController } from './controllers/participants/TogglePresenceController'

const router = Router()

router.post('/', new CreateParticipantController().handle)
router.get('/', isAuthenticated, new ListParticipantsByEventController().handle)
router.patch('/presence/toggle', isAuthenticated, new TogglePresenceController().handle)

export { router }
