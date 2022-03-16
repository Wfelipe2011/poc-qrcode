import { Injectable } from '@nestjs/common';
import { AxiosAdapter } from './infra/Http/axios.adapter';
import { JobSchedule } from './infra/job-schedule';

@Injectable()
export class AppService {
  jobSchedule: JobSchedule;
  constructor() {
    this.jobSchedule = new JobSchedule(new AxiosAdapter());
    this.startJob();
  }

  startJob() {
    // this.jobSchedule.execute('*/10 6-20 * * 1-5');
  }
}
