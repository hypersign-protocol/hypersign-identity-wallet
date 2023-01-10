import { SUPERHERO_HS_AUTH_BASE_URL } from './hsConstants'
import Axios from 'axios';
export default class EdvService {

    endPoint;
    constructor() {
        this.endPoint = SUPERHERO_HS_AUTH_BASE_URL;
    }

    async sync(user, document) {
        let url = this.endPoint + "hs/api/v2/sync";
        const authToken = localStorage.getItem('authToken')
        const res = await Axios.post(url, {
            user: user,
            document: document
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken

            }
        })

        return res.data;

    }



    async resync(userId) {
        let url = this.endPoint + "hs/api/v2/sync";
        const authToken = localStorage.getItem('authToken')

        const res = await Axios.get(url + '/' + userId, {
            headers: {
                'Authorization': 'Bearer ' + authToken

            }
        })

        return res.data;
    }


    async verifyToken() {
        let url = this.endPoint + "hs/api/v2/sync/verifytoken";
        const authToken = localStorage.getItem('authToken')

        const res = await Axios.post(url, null, {
            headers: {
                'Authorization': 'Bearer ' + authToken

            }
        })
        return res.data
    }
    async getWalletDataEncrypted(userId) {
        const data = await this.resync(userId)
        return data
    }



}