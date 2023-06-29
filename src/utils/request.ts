import axios from 'axios';
import { requestError } from '@/errors';

async function get<T>(url: string) {
  try {
    const result = await axios.get<T>(url);
    return result;
  } catch (error) {
    const { status, statusText } = error.response;

    return requestError(status, statusText);
  }
}

export const request = {
  get,
};
