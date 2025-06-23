import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Course, Semester } from '@prisma/client'
import { CreateParticipantService } from '../../services/participants/CreateParticipantService'
import { AppError } from '../../errors/AppError'
import axios from 'axios'
import prismaClient from '../../prisma'
import { sendEmail } from '../../services/email/SendEmailService'
import { formatDateTime, isValidEmail } from '../../utils/utils'

class CreateParticipantController {
  async handle(req: Request, res: Response) {
    const { eventId, name, email, course, semester, ra } = req.body

    // Basic validations for required fields
    if (!eventId || !name || !email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Required fields: eventId, name, email'
      })
    }
    if (!isValidEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'E-mail inválido'
      })
    }

    // enum´s validations
    let validatedCourse: Course | undefined = undefined
    if (course) {
      const upperCourse = course.toUpperCase() as keyof typeof Course
      if (!(upperCourse in Course)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Invalid course' })
      }
      validatedCourse = Course[upperCourse]
    }

    let validatedSemester: Semester | undefined = undefined
    if (semester) {
      const upperSemester = semester.toUpperCase() as keyof typeof Semester
      if (!(upperSemester in Semester)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Invalid semester' })
      }
      validatedSemester = Semester[upperSemester]
    }

    // Busca dados do evento
    let eventData
    try {
      const response = await axios.get(
        `${process.env.EVENT_SERVICE_URL}/details`,
        { params: { event_id: eventId } }
      )
      if (response.status !== StatusCodes.OK) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Evento não encontrado' })
      }
      eventData = response.data.data
    } catch (error) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'Evento não encontrado' })
    }

    // Validação de domínio de email se evento for restrito
    if (eventData.isRestricted) {
      const rawDomains = process.env.ALLOWED_EMAIL_DOMAINS || ''
      const allowedDomains = rawDomains
        .split(',')
        .map(domain => domain.trim().toLowerCase())
      const emailIsValid = allowedDomains.some(domain =>
        email.toLowerCase().endsWith(domain)
      )
      if (!emailIsValid) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Este evento é restrito a emails institucionais.'
        })
      }
    }

    const whereClause: any = {
      eventId,
      OR: [{ email }]
    }

    if (ra) {
      whereClause.OR.push({ ra })
    }

    const existing = await prismaClient.participant.findFirst({
      where: whereClause
    })
    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({
        error: 'Você já está inscrito neste evento!'
      })
    }

    // Verifica limite de participantes
    const participantsCount = await prismaClient.participant.count({
      where: { eventId }
    })
    if (participantsCount >= eventData.maxParticipants) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error:
          'A quantidade máxima de participantes para este evento já foi atingida.'
      })
    }

    try {
      const service = new CreateParticipantService()
      const result = await service.execute({
        eventId,
        name,
        email,
        course: validatedCourse,
        semester: validatedSemester,
        ra
      })

      // Atualiza contador de participantes no serviço de eventos
      await axios.patch(
        `${process.env.EVENT_SERVICE_URL}/update-participant-count`,
        {
          eventId,
          action: 'increment'
        }
      )

      // Formata data e hora do evento
      const { date } = formatDateTime(eventData.startDate)
      const { time } = formatDateTime(eventData.startTime)

      // Define local
      const local =
        eventData.location === 'OUTROS'
          ? eventData.customLocation
          : eventData.location

      // Monta corpo do e-mail
      const emailBody = `
Olá ${name},

Parabéns, você se inscreveu com sucesso no evento: ${eventData.name}

Data: ${date} / Horário: ${time}
Local: ${local}
Palestrante: ${eventData.speakerName}
Descrição: ${eventData.description}

Se precisar de mais informações, entre em contato com a organização.

Atenciosamente,
Equipe SysNevent
      `.trim()

      // Define o assunto do e-mail
      const subject = 'Inscrição realizada com sucesso!'

      // Dispara email de confirmação
      await sendEmail({
        to: email,
        subject,
        emailBody
      })

      return res.status(StatusCodes.CREATED).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error when registering participant' })
    }
  }
}

export { CreateParticipantController }
