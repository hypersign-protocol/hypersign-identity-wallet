import cryptoService from "./cryptoService"
import {SUPERHERO_HS_AUTH_BASE_URL} from "../popup/utils/hsConstants"
export default {
    methods: {
        async syncSW(worker,store) {

          
           

                const password = store.getters.password
                const mnemonic = store.state.mnemonic
                const hypersign = store.getters.hypersign
                const profile = hypersign.profile

                if(password===null || mnemonic===null  || hypersign===null|| profile===null ){
                    return
                }

                const documentId = 'randomId'

                const userData = {
                    userId: profile.email,
                    sequenceNo: 0,
                    docId: documentId,
                }
              
                const encryptedMessage = await cryptoService.methods.encryptWalletNoPopUP(mnemonic, hypersign, password)

                const data = {
                    encryptedMessage
                  }

                  const authToken=localStorage.getItem('authToken')
                  
                  const url=SUPERHERO_HS_AUTH_BASE_URL+"hs/api/v2/sync"
                  worker.postMessage({url,method:"POST",headers:{
                    
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authToken
                      
                  },body:{
                    user:userData,
                    document:data
                  }})
                // await navigator.serviceWorker.getRegistrations().then(async registration => {
                //    await registration[0].active.postMessage({ user:userData,data,authToken})
                //     registration[0].sync.register('sync').then(() => console.log("Sync registered"))

                // })



            
        }
    }
}