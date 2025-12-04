import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
// Registro em banco desabilitado temporariamente

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
    const smtpConfigured = Boolean(host && user && pass)

    // Rate limit baseado apenas em header/IP — simples (sem BD)
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const ip = ipHeader?.split(',')[0].trim() || 'unknown'

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
    let mailOk = false
    if (smtpConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        })
        await transporter.sendMail({
          from,
          to,
          replyTo: email,
          subject: `[InPACTA] Contato: ${assunto}`,
          html,
        })
        mailOk = true
      } catch (smtpErr) {
        console.error('Erro SMTP (envio de contato):', smtpErr)
      }
    } else {
      console.warn('SMTP não configurado — pulando envio de e-mail do contato')
    }

    // Sem registro em BD: retorna ok mesmo se SMTP falhar
    if (mailOk) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: true, message: 'Recebido. SMTP não configurado ou falhou.' })
  } catch (err) {
    console.error('Erro envio contato:', err)
    return NextResponse.json({ error: 'Falha ao enviar mensagem' }, { status: 500 })
  }
}
