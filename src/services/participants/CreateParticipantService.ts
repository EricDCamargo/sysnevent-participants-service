import prismaClient from '../../prisma'
import { AppResponse } from '../../@types/app.types'
import { Course, Semester } from '@prisma/client'

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
    const participant = await prismaClient.participant.create({
      data: {
        eventId,
        name,
        email,
        course,
        semester,
        ...(ra?.trim() && { ra: ra.trim() }),
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
