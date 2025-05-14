import prismaClient from '../../prisma'
import { AppError } from '../../errors/AppError'
import { AppResponse } from '../../@types/app.types'
import { StatusCodes } from 'http-status-codes'
import axios from 'axios'

interface CreateTicketRequest {
  event_id: string
  participant_id: string
}

class CreateTicketService {
  async execute({ event_id, participant_id }: CreateTicketRequest): Promise<AppResponse> {
    // 1. Verifica duplicidade
    const existing = await prismaClient.ticket.findUnique({
      where: {
        eventId_participantId: {
          eventId: event_id,
          participantId: participant_id
        }
      }
    })

    if (existing) {
      throw new AppError('Você já comprou ingresso para este evento.', StatusCodes.CONFLICT)
    }

    // 2. Consulta o evento via API REST
    const eventApi = process.env.EVENT_SERVICE_URL
    let event
    try {
      const response = await axios.get(`${eventApi}/events/${event_id}`)
      event = response.data.data
    } catch {
      throw new AppError('Evento não encontrado', StatusCodes.NOT_FOUND)
    }

    // 3. Valida se está ativo
    if (!event.status) {
      throw new AppError('Este evento não está mais disponível.', StatusCodes.BAD_REQUEST)
    }

    // 4. Verifica capacidade atual (total ingressos comprados para o evento)
    const ticketsCount = await prismaClient.ticket.count({
      where: { eventId: event_id }
    })

    if (ticketsCount >= event.capacity) {
      throw new AppError('Capacidade do evento esgotada.', StatusCodes.BAD_REQUEST)
    }

    // 5. Compra o ingresso
    const ticket = await prismaClient.ticket.create({
      data: {
        eventId: event_id,
        participantId: participant_id
      }
    })

    return {
      data: ticket,
      message: 'Ingresso comprado com sucesso!'
    }
  }
}

export { CreateTicketService }
