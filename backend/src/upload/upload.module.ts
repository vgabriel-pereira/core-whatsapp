import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MulterModule.register({}), MessageModule],
  controllers: [UploadController],
  providers: [UploadService, PrismaService],
})
export class UploadModule { }