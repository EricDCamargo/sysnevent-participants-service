import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { StatusCodes } from 'http-status-codes'

import { router } from './routes'

const app = express()
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  console.log('\n--- [MICROSERVIÇO PARTICIPANTES] Requisição recebida ---')
  console.log(`[METHOD] ${req.method}`)
  console.log(`[URL] ${req.url}`) // <- importante
  console.log(`[ORIGINAL URL] ${req.originalUrl}`) // <- também ajuda
  console.log('[HEADERS]', req.headers)
  console.log('[BODY]', req.body)
  console.log('--------------------------------------------------\n')

  const originalSend = res.send
  res.send = function (body) {
    // Log da response ao enviar
    console.log('\n--- [MICROSERVIÇO PARTICIPANTES] Resposta enviada ---')
    console.log(`[STATUS] ${res.statusCode}`)
    console.log('[HEADERS]', res.getHeaders())
    console.log('[BODY]', body)
    console.log('--------------------------------------------------\n')
    return originalSend.call(this, body)
  }
  next()
})

app.use(router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: err.message
    })
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    messege: 'Internal server error'
  })
})

app.listen(process.env.PORT, () =>
  console.log('Server online na porta', process.env.PORT)
)
