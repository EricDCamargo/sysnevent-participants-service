import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Course, Semester } from '@prisma/client'
import { CreateParticipantService } from '../../services/participants/CreateParticipantService'
import { AppError } from '../../errors/AppError'

class CreateParticipantController {
  async handle(req: Request, res: Response) {
    const { eventId, name, email, course, semester, ra } = req.body

    // Basic validations for required fields
    if (!eventId || !name || !email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Required fields: eventId, name, email'
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
