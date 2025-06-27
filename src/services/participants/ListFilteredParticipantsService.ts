import prismaClient from '../../prisma'
import { AppResponse } from '../../@types/app.types'

interface FilterParams {
  event_id: string
  onlyStudents: boolean
  onlyFatec: boolean
  onlyExternal: boolean
  onlyPresent: boolean
}

class ListFilteredParticipantsService {
  private allowedDomains: string[]

  constructor() {
    const envDomains = process.env.ALLOWED_EMAIL_DOMAINS || ''
    this.allowedDomains = envDomains.split(',').map(d => d.trim())
  }

  async execute({
    event_id,
    onlyStudents,
    onlyFatec,
    onlyExternal,
    onlyPresent
  }: FilterParams): Promise<AppResponse> {
    const where: any = {
      eventId: event_id
    }

    if (onlyPresent) {
      where.isPresent = true
    }

    const orFilters: any[] = []

    if (onlyStudents) {
      orFilters.push({
        NOT: {
          ra: null
        }
      })
    }

    if (onlyFatec) {
      orFilters.push(
        ...this.allowedDomains.map(domain => ({
          email: {
            endsWith: domain
          }
        }))
      )
    }

    if (onlyExternal) {
      orFilters.push({
        AND: [
          { ra: null },
          {
            NOT: {
              OR: this.allowedDomains.map(domain => ({
                email: {
                  endsWith: domain
                }
              }))
            }
          }
        ]
      })
    }

    if (orFilters.length > 0) {
      where.OR = orFilters
    }

    let participants = await prismaClient.participant.findMany({
      where
    })

    const getGroupScore = (p: any): number => {
      const isStudent = !!p.ra
      const isFatec = this.allowedDomains.some(domain =>
        p.email.endsWith(domain)
      )

      if (isStudent) return 0
      if (isFatec) return 1
      return 2
    }

    participants.sort((a, b) => {
      const groupDiff = getGroupScore(a) - getGroupScore(b)
      if (groupDiff !== 0) return groupDiff
      return a.name.localeCompare(b.name)
    })

    return {
      data: participants,
      message: 'Filtered participants retrieved successfully.'
    }
  }
}

export { ListFilteredParticipantsService }
