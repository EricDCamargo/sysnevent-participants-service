import { Request, Response } from 'express'
import { CreateTicketService } from '../../services/ticket/CreateTicketService'
import { AppError } from '../../errors/AppError'
import { StatusCodes } from 'http-status-codes'

class CreateTicketController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id
    const { event_id } = req.body

    const service = new CreateTicketService()

    try {
      const result = await service.execute({
        event_id,
        participant_id: user_id
      })
      return res.status(StatusCodes.CREATED).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Erro interno ao comprar ingresso' })
    }
  }
}

export { CreateTicketController }
