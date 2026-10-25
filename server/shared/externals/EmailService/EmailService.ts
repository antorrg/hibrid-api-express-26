import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import envConfig from '../../../configs/envConfig.js'

const TEMPLATE_DIR = fileURLToPath(new URL('./emails', import.meta.url))
// Tipo para valores de variables en templates
export type TemplateVariables = Record<string, string | number | boolean | Date>

// ========== INTERFACES ==========

export interface IEmailTransport {
  send(options: EmailSendOptions): Promise<void>
}

export interface EmailSendOptions {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

export interface IEmailService {
  sendTemplateEmail(
    templateName: string,
    variables: TemplateVariables,
    options: {
      to: string
      subject: string
      replyTo?: string
    }
  ): Promise<void>
  sendRawEmail(options: EmailSendOptions): Promise<void>
  sendEmail(to: string, subject: string, message: string): Promise<void>
}

// ========== NODEMAILER TRANSPORT (Producción) ==========

export class NodemailerTransport implements IEmailTransport {
  #transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    service: 'gmail',
    auth: {
      user: envConfig.GmailUser,
      pass: envConfig.GmailPass
    },
    tls: {
      rejectUnauthorized: false
    },
    // Forzar el uso de IPv4 (familia 4)
    // Esto resuelve el error "ENETUNREACH 2607..." cuando el servidor no tiene IPv6 bien configurado
    family: 4
  } as any)

  async send(options: EmailSendOptions): Promise<void> {
    await this.#transporter.sendMail({
      from: options.from ?? `"antorrg-software" <${envConfig.GmailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo
    })
  }
}

// ========== MOCK TRANSPORT (Testing) ==========

export class MockEmailTransport implements IEmailTransport {
  public sent: EmailSendOptions[] = []

  async send(options: EmailSendOptions): Promise<void> {
    this.sent.push(options)
  }

  reset(): void {
    this.sent = []
  }
}

// ========== EMAIL SERVICE (Lógica de negocio) ==========

export class EmailService implements IEmailService {
  constructor(
    private readonly transport: IEmailTransport
  ) { }

  async sendTemplateEmail(
    templateName: string,
    variables: TemplateVariables,
    options: {
      to: string
      subject: string
      replyTo?: string
    }
  ): Promise<void> {
    const html = await this.#getEmailTemplate(templateName, variables)

    await this.transport.send({
      to: options.to,
      subject: options.subject,
      html,
      replyTo: options.replyTo
    })
  }

  async sendRawEmail(options: EmailSendOptions): Promise<void> {
    await this.transport.send(options)
  }

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    await this.sendRawEmail({
      to,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br/>')}</p>`
    })
  }
  async #getEmailTemplate(
    templateName: string, 
    variables: TemplateVariables
  ): Promise<string> {
    const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`)
  
    let html = await fs.readFile(filePath, 'utf-8')
  
    // Reemplazo usando una única expresión regular global
    html = html.replace(/{{\s*([\w]+)\s*}}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match
    })
  
    return html
  }
}

// ========== INSTANCIA SINGLETON (Producción) ==========

export const emailService = new EmailService(
  new NodemailerTransport()
)