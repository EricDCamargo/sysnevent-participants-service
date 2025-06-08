import prismaClient from '../../prisma'
import { AppError } from '../../errors/AppError'
import { StatusCodes } from 'http-status-codes'

interface TogglePresenceRequest {
  participantId: string
}

class TogglePresenceService {
  async execute({ participantId }: TogglePresenceRequest) {
    const participant = await prismaClient.participant.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      throw new AppError(
        'Participante do evento não encontrado.',
        StatusCodes.NOT_FOUND
      )
    }

    const updated = await prismaClient.participant.update({
      where: { id: participantId },
      data: { isPresent: !participant.isPresent }
    })

    return {
      data: updated,
      message: updated.isPresent
        ? 'Presença registarda com sucesso.'
        : 'Presença removida com sucesso.'
    }
  }
}

export { TogglePresenceService }
