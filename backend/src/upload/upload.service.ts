import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async processFile(buffer: Buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('A planilha está vazia ou corrompida');
      
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      if (!data.length) throw new Error('A planilha não contém dados');
      
      console.log('Dados da planilha:', data);
      
      const contacts = data.map((row: any) => {
        const rawPhone = String(row['Telefone'] || '').replace(/\D/g, '');
        const formattedPhone = this.formatPhoneNumber(rawPhone);
        
        return {
          name: row['Nome']?.trim() || 'Desconhecido',
          phone: formattedPhone,
          status: 'pending',
        };
      }).filter(contact => contact.phone !== '');
      
      // Inserir contatos válidos no banco, evitando duplicatas
      for (const contact of contacts) {
        const existingContact = await this.prisma.contact.findUnique({
          where: { phone: contact.phone },
        });
        
        if (!existingContact) {
          await this.prisma.contact.create({ data: contact });
        } else {
          console.warn(`Contato ${contact.name} já existe no banco.`);
        }
      }
      
      return { success: true, message: 'Planilha processada com sucesso!' };
    } catch (error) {
      console.error('Erro ao processar planilha:', error.message);
      throw new Error('Erro ao processar planilha: ' + error.message);
    }
  }

  private formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    if (phone.length === 10 || phone.length === 11) {
      return `55${phone}`;
    }
    
    return '';
  }
}