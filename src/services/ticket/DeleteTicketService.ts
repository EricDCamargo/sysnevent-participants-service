import prismaClient from '../../prisma'
import { AppError } from '../../errors/AppError'
import { AppResponse } from '../../@types/app.types'
import { StatusCodes } from 'http-status-codes'

interface DeleteTicketRequest {
  ticket_id: string
  participant_id: string
}

class DeleteTicketService {
  async execute({ ticket_id, participant_id }: DeleteTicketRequest): Promise<AppResponse> {
    const ticket = await prismaClient.ticket.findUnique({
      where: { id: ticket_id }
    })

    if (!ticket) {
      throw new AppError('Ingresso não encontrado.', StatusCodes.NOT_FOUND)
    }

    if (ticket.participantId !== participant_id) {
      throw new AppError('Você não tem permissão para cancelar este ingresso.', StatusCodes.FORBIDDEN)
    }

    await prismaClient.ticket.delete({
      where: { id: ticket_id }
    })

    return {
      data: null,
      message: 'Ingresso cancelado com sucesso!'
    }
  }
}

export { DeleteTicketService }
