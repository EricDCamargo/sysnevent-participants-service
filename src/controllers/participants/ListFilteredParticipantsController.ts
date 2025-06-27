import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../../errors/AppError'
import { ListFilteredParticipantsService } from '../../services/participants/ListFilteredParticipantsService'
import axios from 'axios'

class ListFilteredParticipantsController {
  async handle(req: Request, res: Response) {
    const { event_id, onlyStudents, onlyFatec, onlyExternal, onlyPresent } =
      req.query

    if (!event_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Parameter "event_id" is required.'
      })
    }

    try {
      const service = new ListFilteredParticipantsService()

      const result = await service.execute({
        event_id: event_id as string,
        onlyStudents: onlyStudents === 'true',
        onlyFatec: onlyFatec === 'true',
        onlyExternal: onlyExternal === 'true',
        onlyPresent: onlyPresent === 'true'
      })

      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch filtered participants.'
      })
    }
  }
}

export { ListFilteredParticipantsController }
