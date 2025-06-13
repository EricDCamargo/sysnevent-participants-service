import prismaClient from '../../prisma'
import { AppError } from '../../errors/AppError'
import { AppResponse } from '../../@types/app.types'
import { StatusCodes } from 'http-status-codes'
import { Course, Semester } from '@prisma/client'
import axios from 'axios'

interface CreateParticipantRequest {
  eventId: string
  name: string
  email: string
  course?: Course
  semester?: Semester
  ra?: string
}

class CreateParticipantService {
  async execute({
    eventId,
    name,
    email,
    course,
    semester,
    ra
  }: CreateParticipantRequest): Promise<AppResponse> {
    const rawDomains = process.env.ALLOWED_EMAIL_DOMAINS || ''
    const allowedDomains = rawDomains
      .split(',')
      .map(domain => domain.trim().toLowerCase())

    let eventData
    try {
      const response = await axios.get(
        `${process.env.EVENT_SERVICE_URL}/details`,
        {
          params: { event_id: eventId }
        }
      )

      if (response.status !== StatusCodes.OK) {
        throw new AppError('Evento não encontrado', StatusCodes.NOT_FOUND)
      }
      eventData = response.data.data
    } catch (error) {
      throw new AppError('Evento não encontrado', StatusCodes.NOT_FOUND)
    }

    if (eventData.isRestricted) {
      const emailIsValid = allowedDomains.some(domain =>
        email.toLowerCase().endsWith(domain)
      )

      if (!emailIsValid) {
        throw new AppError(
          'Este evento é restrito a emails institucionais.',
          StatusCodes.FORBIDDEN
        )
      }
    }

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

    if (participantsCount >= eventData.maxParticipants) {
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
    await axios.patch(
      `${process.env.EVENT_SERVICE_URL}/update-participant-count`,
      {
        eventId,
        action: 'increment'
      }
    )
    return {
      data: participant,
      message: 'Partcipante inscrito com sucesso!'
    }
  }
}

export { CreateParticipantService }
