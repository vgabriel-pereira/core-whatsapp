import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },     // Planilha
      { name: 'image', maxCount: 1 },    // Imagem opcional
    ])
  )
  async handleUpload(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() body: any
  ) {
    const planilha = files.file?.[0];
    const imagem = files.image?.[0]; // Se quiser salvar ou validar

    if (!planilha) {
      return { success: false, message: 'Nenhuma planilha recebida.' };
    }

    const result = await this.uploadService.processFile(planilha.buffer);
    return result;
  }
}