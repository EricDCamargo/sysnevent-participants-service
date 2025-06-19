import nodemailer from 'nodemailer'

interface SendEmailParams {
  to: string
  subject: string
  emailBody: string
}

export async function sendEmail({ to, subject, emailBody }: SendEmailParams) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: emailBody
  })
}
