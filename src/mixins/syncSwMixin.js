import cryptoService from "./cryptoService"
import {SUPERHERO_HS_AUTH_BASE_URL} from "../popup/utils/hsConstants"
export default {
    methods: {
        async syncSW(worker) {

            if (localStorage.getItem('time') === null) {
                localStorage.setItem('time', Date.now())

            }
            if (((Date.now() - localStorage.getItem('time')) / 1000) > 5) {

                const password = this.$store.getters.password
                const mnemonic = this.$store.state.mnemonic
                const hypersign = this.$store.getters.hypersign
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



                this.$store.commit('storeupdatedRest')
                localStorage.setItem('time', Date.now())
            }
        }
    }
}