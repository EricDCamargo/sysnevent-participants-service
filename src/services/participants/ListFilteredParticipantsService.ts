import prismaClient from '../../prisma'
import { AppResponse } from '../../@types/app.types'

interface FilterParams {
  event_id: string
  apenasAlunos: boolean
  apenasFatec: boolean
  apenasExternos: boolean
}

class ListFilteredParticipantsService {
  private allowedDomains: string[]

  constructor() {
    const envDomains = process.env.ALLOWED_EMAIL_DOMAINS || ''
    this.allowedDomains = envDomains.split(',').map(d => d.trim())
  }

  async execute({
    event_id,
    apenasAlunos,
    apenasFatec,
    apenasExternos
  }: FilterParams): Promise<AppResponse> {
    const where: any = {
      eventId: event_id
    }

    const orFilters: any[] = []

    if (apenasAlunos) {
      orFilters.push({
        NOT: {
          ra: null
        }
      })
    }

    if (apenasFatec) {
      orFilters.push(
        ...this.allowedDomains.map(domain => ({
          email: {
            endsWith: domain
          }
        }))
      )
    }

    if (apenasExternos) {
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

    // Se houver filtros aplicados, adiciona como OR
    if (orFilters.length > 0) {
      where.OR = orFilters
    }

    let participants = await prismaClient.participant.findMany({
      where
    })

    const getGroupScore = (p: any): number => {
      const isAluno = !!p.ra
      const isFatec = this.allowedDomains.some(domain =>
        p.email.endsWith(domain)
      )

      if (isAluno) return 0 // alunos com RA
      if (isFatec) return 1 // domínio fatec, mas sem RA
      return 2 // externos
    }

    // Ordenação composta: grupo → nome
    participants.sort((a, b) => {
      const groupDiff = getGroupScore(a) - getGroupScore(b)
      if (groupDiff !== 0) return groupDiff
      return a.name.localeCompare(b.name)
    })

    return {
      data: participants,
      message: 'Participantes filtrados com sucesso.'
    }
  }
}

export { ListFilteredParticipantsService }
