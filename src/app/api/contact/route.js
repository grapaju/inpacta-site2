import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function sanitize(str) {
  return String(str || '').trim()
}

export async function POST(request) {
  try {
    const data = await request.json()

    const nome = sanitize(data?.nome)
    const email = sanitize(data?.email)
    const organizacao = sanitize(data?.organizacao)
    const assunto = sanitize(data?.assunto)
    const mensagem = sanitize(data?.mensagem)
    const honeypot = sanitize(data?.website)

    if (honeypot) {
      return NextResponse.json({ ok: true, message: 'OK' })
    }

    if (!nome || !email || !assunto || !mensagem) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const to = process.env.CONTACT_TO || 'contato@inpacta.tech'
    const from = process.env.CONTACT_FROM || `InPACTA <no-reply@inpacta.tech>`

    if (!host || !user || !pass) {
      return NextResponse.json({
        error: 'SMTP não configurado (defina SMTP_HOST, SMTP_USER, SMTP_PASS)'
      }, { status: 500 })
    }

    // Rate limit simples por IP: máximo 3 envios por 10 minutos
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.ip || 'unknown'
    const windowMs = 10 * 60 * 1000
    const since = new Date(Date.now() - windowMs)
    const recentCount = await prisma.contactSubmission.count({
      where: { ip, createdAt: { gte: since } }
    })
    if (recentCount >= 3) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const html = `
      <h2>Novo contato pelo site</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Organização:</strong> ${organizacao || '-'} </p>
      <p><strong>Assunto:</strong> ${assunto}</p>
      <p><strong>Mensagem:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${mensagem}</pre>
      <hr/>
      <p>Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
    `

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `[InPACTA] Contato: ${assunto}`,
      html,
    })

    // Registrar envio no banco
    await prisma.contactSubmission.create({
      data: {
        name: nome,
        email,
        organization: organizacao || null,
        subject: assunto,
        message: mensagem,
        ip
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro envio contato:', err)
    return NextResponse.json({ error: 'Falha ao enviar mensagem' }, { status: 500 })
  }
}
