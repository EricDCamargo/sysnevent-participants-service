import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../../errors/AppError'
import { ListParticipantsByEventService } from '../../services/participants/ListParticipantsByEventService'

class ListParticipantsByEventController {
  async handle(req: Request, res: Response) {
    const event_id = req.query.event_id as string

    if (!event_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Event ID is required.' })
    }

    try {
      const service = new ListParticipantsByEventService()
      const result = await service.execute(event_id)

      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to list participants' })
    }
  }
}

export { ListParticipantsByEventController }
