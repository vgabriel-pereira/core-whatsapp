import { Controller, Post, Get, Body, BadRequestException, Param, Query, Delete } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}



  @Post('send')
  async sendMessage(@Body('number') number: string, @Body('message') message: string) {
    if (!number || !message) {
      throw new BadRequestException('Número e mensagem são obrigatórios');
    }
    await this.messageService.sendMessage(number, message);
    return { status: 'success', message: 'Mensagem enviada com sucesso!' };
  }
  @Post('send-from-db')
  async sendMessagesFromDB(@Body('message') message: string) {
    if (!message) throw new BadRequestException('Mensagem é obrigatória');
    await this.messageService.sendMessagesFromDB(message);
    return { status: 'success', message: 'Mensagens enviadas com sucesso!' };
}

  @Get('contacts')
  async getContacts(@Query('status') status?: string, @Query('search') search?: string) {
    const where: any = {};
  
    if (status && status !== 'todos') {
      where.status = status;
    }
  
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
  
    return this.messageService.getAllContacts(where);
  }
  @Delete('delete-sent')
  async deleteSentContacts() {
    await this.messageService.deleteSentContacts();
    return { success: true, message: 'Contatos enviados apagados com sucesso!' };
  }
  
  @Post('resend/:id')
  async resendMessage(@Param('id') id: string) {
    const contactId = parseInt(id);
    if (isNaN(contactId)) {
      throw new BadRequestException('ID inválido');
    }
  
    await this.messageService.resendMessageById(contactId);
    return { status: 'success', message: 'Mensagem reenviada com sucesso!' };
  }
  @Get('qr')
  getQR(){
    return {qr: this.messageService.getQR()};
  }
  @Get('status')
  getStatus(){
    return {connected: this.messageService.getConnectionStatus()}
  }

}