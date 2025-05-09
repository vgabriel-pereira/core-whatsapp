import { Injectable, OnModuleInit } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class MessageService implements OnModuleInit {
  private sock: any;
  private currentQR: string | null = null;
  private isConnected = false

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.connectToWhatsApp();
  }

  private async connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    this.sock.ev.on('creds.update', saveCreds);
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.currentQR = await QRCode.toDataURL(qr)
        this.isConnected = false
        console.log('Escaneie o QR Code abaixo para conectar:');
        console.log(await QRCode.toString(qr, { type: 'terminal' }));
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('Tentando reconectar...');
          await this.connectToWhatsApp();
        } else {
          console.log('Desconectado permanentemente.');
        }
      }

      if (connection === 'open') {
        this.isConnected = true
        this.currentQR= null
        console.log('Conectado ao WhatsApp!');
      }
    });
  }

  async sendMessage(number: string, text: string) {
    try {
      const jid = number + '@s.whatsapp.net';
      await this.sock.sendMessage(jid, { text });
      console.log(`✅ Mensagem enviada para ${number}: ${text}`);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  }

  private getRandomDelay(min = 10000, max = 30000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async sendMessagesFromDB(message: string) {
    const contacts = await this.prisma.contact.findMany({ where: { status: 'pending' } });

    for (let i = 0; i < contacts.length; i += 100) {
      const batch = contacts.slice(i, i + 100);

      for (const contact of batch) {
        try {
          const personalizedMessage = message.replace('{nome}', contact.name || '');
          await this.sendMessage(contact.phone, personalizedMessage);
          await this.prisma.contact.update({
            where: { id: contact.id },
            data: { status: 'sent' },
          });
          const delay = this.getRandomDelay();
          console.log(`⏳ Aguardando ${delay}ms antes do próximo envio...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
          console.error(`Erro ao enviar mensagem para ${contact.phone}:`, error);
        }
      }

      console.log(`⏳ Aguardando 60 segundos antes do próximo lote...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  async deleteSentContacts() {
    await this.prisma.contact.deleteMany({ where: { status: 'sent' } });
    this.disconnectAndDeleteAuth()
  }
  private disconnectAndDeleteAuth() {
    if (this.sock) {
      this.sock.ws.close();
    }

    if (fs.existsSync('./auth_info_baileys')) {
      fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
      console.log('🔒 Pasta ./auth_info_baileys deletada com sucesso.');
    }
  }

  async getAllContacts(where = {}) {
    return this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
  getQR(){
    return this.currentQR
  }
  getConnectionStatus(){
    return this.isConnected
  }

  async resendMessageById(contactId: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new Error('Contato não encontrado');

    try {
      const personalizedMessage = `Olá ${contact.name}, esta é uma mensagem automática.`;
      await this.sendMessage(contact.phone, personalizedMessage);
      await this.prisma.contact.update({
        where: { id: contact.id },
        data: { status: 'sent' },
      });
    } catch (error) {
      console.error(`Erro ao reenviar mensagem para ${contact.phone}:`, error);
    }
  }
}
