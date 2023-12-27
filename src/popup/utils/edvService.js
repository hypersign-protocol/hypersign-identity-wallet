import Axios from 'axios';
import { SUPERHERO_HS_AUTH_BASE_URL } from './hsConstants';

export default class EdvService {
  endPoint;

  constructor() {
    this.endPoint = SUPERHERO_HS_AUTH_BASE_URL;
  }

  async sync(user, document) {
    const url = `${this.endPoint}hs/api/v2/sync`;
    const authToken = localStorage.getItem('authToken');
    const res = await Axios.post(
      url,
      {
        user,
        document,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    return res.data;
  }

  async resync(userId) {
    const url = `${this.endPoint}hs/api/v2/sync`;
    const authToken = localStorage.getItem('authToken');
    const res = await Axios.get(`${url}/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return res.data;
  }

  async verifyToken() {
    const url = `${this.endPoint}hs/api/v2/sync/verifytoken`;
    const authToken = localStorage.getItem('authToken');
    const res = await Axios.post(url, null, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return res;
  }

  async getWalletDataEncrypted(userId) {
    const data = await this.resync(userId);
    return data;
  }
}
