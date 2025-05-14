import { Request, Response } from 'express'
import { ListTicketsService } from '../../services/ticket/ListTicketsService'
import { AppError } from '../../errors/AppError'
import { StatusCodes } from 'http-status-codes'

class ListTicketsController {
  async handle(req: Request, res: Response) {
    const participant_id = req.user_id
    const service = new ListTicketsService()

    try {
      const result = await service.execute(participant_id)
      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Erro interno ao buscar ingressos' })
    }
  }
}

export { ListTicketsController }
