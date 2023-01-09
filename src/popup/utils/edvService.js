import { SUPERHERO_HS_AUTH_BASE_URL } from './hsConstants'
import Axios from 'axios';
export default class edvService {

    endPoint;
    constructor() {
        this.endPoint = SUPERHERO_HS_AUTH_BASE_URL;
    }

    async sync(user, document) {
        let url = this.endPoint + "hs/api/v2/sync";
        const res = await Axios.post(url, {
            user: user,
            document: document
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + 'token'

            }
        })

        return res.data;

    }



    async resync(userId){
        let url = this.endPoint + "hs/api/v2/sync";
        const res = await Axios.get(url+'/'+userId
        )

        return res.data;
    }
}