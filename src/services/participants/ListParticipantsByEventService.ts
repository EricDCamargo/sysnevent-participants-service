import prismaClient from '../../prisma'

class ListParticipantsByEventService {
  async execute(eventId: string) {
    const participants = await prismaClient.participant.findMany({
      where: {
        eventId,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return participants
  }
}

export { ListParticipantsByEventService }
