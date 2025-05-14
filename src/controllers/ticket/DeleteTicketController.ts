import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../../errors/AppError'
import { DeleteTicketService } from '../../services/ticket/DeleteTicketService'

class DeleteTicketController {
  async handle(req: Request, res: Response) {
    const ticket_id = req.params.id
    const participant_id = req.user_id

    const deleteTicketService = new DeleteTicketService()

    try {
      const result = await deleteTicketService.execute({
        ticket_id,
        participant_id
      })
      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Erro interno ao cancelar ingresso' })
    }
  }
}

export { DeleteTicketController }
