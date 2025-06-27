import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../../errors/AppError'
import { ListFilteredParticipantsService } from '../../services/participants/ListFilteredParticipantsService'

class ListFilteredParticipantsController {
  async handle(req: Request, res: Response) {
    const { event_id, apenasAlunos, apenasFatec, apenasExternos } = req.query

    if (!event_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Parâmetro "event_id" é obrigatório.'
      })
    }

    try {
      const service = new ListFilteredParticipantsService()

      const result = await service.execute({
        event_id: event_id as string,
        apenasAlunos: apenasAlunos === 'true',
        apenasFatec: apenasFatec === 'true',
        apenasExternos: apenasExternos === 'true'
      })

      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Erro ao buscar participantes filtrados.'
      })
    }
  }
}

export { ListFilteredParticipantsController }
