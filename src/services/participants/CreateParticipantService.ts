import prismaClient from '../../prisma'
import { AppError } from '../../errors/AppError'
import { AppResponse } from '../../@types/app.types'
import { StatusCodes } from 'http-status-codes'
import { Course, Semester } from '@prisma/client'

interface CreateParticipantRequest {
  eventId: string
  name: string
  email: string
  course?: Course
  semester?: Semester
  ra?: string
  maxParticipants: number
}

class CreateParticipantService {
  async execute({
    eventId,
    name,
    email,
    course,
    semester,
    ra,
    maxParticipants
  }: CreateParticipantRequest): Promise<AppResponse> {
    // Check if there's already a registration for this event with the same email or RA
    const existing = await prismaClient.participant.findFirst({
      where: {
        eventId,
        OR: [
          { email },
          { ra: ra ?? '' } // use empty string if ra is undefined to avoid null issues because a participant can register without RA, a non fatec student
        ]
      }
    })

    if (existing) {
      throw new AppError(
        'Você já está inscrito neste evento!',
        StatusCodes.CONFLICT
      )
    }

    // Check current number of participants in the event
    const participantsCount = await prismaClient.participant.count({
      where: { eventId }
    })

    if (participantsCount >= maxParticipants) {
      throw new AppError(
        'A quantidade máxima de participantes para este evento já foi atingida.',
        StatusCodes.BAD_REQUEST
      )
    }

    const participant = await prismaClient.participant.create({
      data: {
        eventId,
        name,
        email,
        course,
        semester,
        ra,
        isPresent: false
      }
    })

    return {
      data: participant,
      message: 'Partcipante inscrito com sucesso!'
    }
  }
}

export { CreateParticipantService }
