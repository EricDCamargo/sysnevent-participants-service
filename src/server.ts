import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { StatusCodes } from 'http-status-codes'

import { router } from './routes'

const app = express()
app.use(express.json())
app.use(cors())

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
