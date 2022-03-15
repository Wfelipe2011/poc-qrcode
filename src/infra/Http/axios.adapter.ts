import axios from 'axios';
import { HttpAdapter } from './http.adapter';

export class AxiosAdapter implements HttpAdapter {
  public async get(url: string): Promise<any> {
    try {
      return await axios({
        url: `${url}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      console.log(error.message);
      return error;
    }
  }

  public async post(url: string, body?: any) {
    try {
      return await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      console.log(error.message);
      return error;
    }
  }
}
