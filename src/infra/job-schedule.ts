import { API } from 'src/main';
import { HttpAdapter } from './Http/http.adapter';
import { Job } from './job.model';
import { JobWork } from './schedule.adapter';

export class JobSchedule extends Job {
  constructor(private readonly httpAdapter: HttpAdapter) {
    super();
  }

  public execute(configCron: string): void {
    JobWork.execute({
      config: configCron,
      start: this.start.bind(this),
    });
  }

  private async start(): Promise<void> {
    this.httpAdapter.get(`${API}/job`);
    this.printDate('start Job Notes');
  }
}
