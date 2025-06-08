import { Request, Response } from 'express'
import { TogglePresenceService } from '../../services/participants/TogglePresenceService'
import { AppError } from '../../errors/AppError'
import { StatusCodes } from 'http-status-codes'

class TogglePresenceController {
  async handle(req: Request, res: Response) {
    const { participantId } = req.body

    if (!participantId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'participant ID is required.' })
    }

    try {
      const service = new TogglePresenceService()
      const result = await service.execute({ participantId })

      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal error while toggling presence.' })
    }
  }
}

export { TogglePresenceController }
