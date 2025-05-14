import { AppResponse } from '../../@types/app.types'
import prismaClient from '../../prisma'

class ListTicketsService {
  async execute(participant_id: string): Promise<AppResponse> {
    const tickets = await prismaClient.ticket.findMany({
      where: { participantId: participant_id },
      orderBy: { purchaseDate: 'desc' }
    })

    return {
      data: tickets,
      message: 'Ingressos encontrados com sucesso!'
    }
  }
}

export { ListTicketsService }
