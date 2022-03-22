import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Notes } from './database/entity/NotesEntity';
import { NotesRepository } from './database/repository/notes.repository';

export interface NotesBody {
  _id?: string;
  code?: string;
  email?: string;
  dateProcessed?: Date;
  dateCreated?: string;
  status?: 'analyse' | 'success' | 'process' | 'pending' | 'invalid';
  note?: any;
}

@Controller()
export class AppController {
  repository: NotesRepository;
  constructor(private readonly appService: AppService) {
    this.repository = new NotesRepository(Notes);
  }

  @Get('notes')
  async startNotes() {
    this.appService.executeJobAnalyse();
    return `Job está processando notas`;
  }

  @Get('notes-pending')
  async startNotesPending() {
    this.appService.executeJobPending();
    return `Job está processando as notas pending`;
  }
}
