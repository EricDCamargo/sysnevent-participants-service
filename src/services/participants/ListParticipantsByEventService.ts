import { AppResponse } from '../../@types/app.types'
import prismaClient from '../../prisma'

class ListParticipantsByEventService {
  async execute(eventId: string): Promise<AppResponse> {
    const participants = await prismaClient.participant.findMany({
      where: {
        eventId
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { data: participants, message: 'Lista de participantes.' }
  }
}

export { ListParticipantsByEventService }
