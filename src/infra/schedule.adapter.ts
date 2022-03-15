import { scheduleJob } from 'node-schedule';
//https://github.com/node-schedule/node-schedule#readme
//https://crontab.guru/
export class JobWork  {
  static execute({ config, start }) {
    scheduleJob(config, () => {
      start();
    });
  }
}
