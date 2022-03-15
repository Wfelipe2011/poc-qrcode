export interface HttpAdapter {
  get(url: string): Promise<any>;
  post(url: string, body?: any): any;
}
