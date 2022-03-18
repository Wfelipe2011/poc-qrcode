import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';

export interface NotesBody {
  _id?: string;
  code?: string;
  email?: string;
  dateProcessed?: Date;
  dateCreated?: string;
  status?: 'success' | 'process' | 'pending' | 'invalid';
  note?: any;
}

@Controller()
export class AppController {
  repository: Repository;
  constructor(private readonly appService: AppService) {
    this.repository = new Repository(User);
  }

  @Get('notes')
  async startNotes() {
    this.appService.executeJob('analyse');
    return `Job está processando notas`;
  }

  @Get('notes-pending')
  async startNotesPending() {
    this.appService.executeJob('pending');
    return `Job está processando as notas pending`;
  }
}
