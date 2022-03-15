export abstract class Job {
  public abstract execute(configCron: string): void;

  protected printDate(text: string) {
    const date = new Date().toLocaleString('en', {
      timeZone: 'America/Sao_Paulo',
    });
    console.log(`${text}: ${date}`);
  }
}
