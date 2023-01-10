import cryptoService from "./cryptoService"
export default {
    methods: {
        async syncSW() {

            if (localStorage.getItem('time') === null) {
                localStorage.setItem('time', Date.now())

            }
            if (((Date.now() - localStorage.getItem('time')) / 1000) > 15) {

                const password = this.$store.getters.password
                const mnemonic = this.$store.state.mnemonic
                const hypersign = this.$store.getters.hypersign
                const profile = hypersign.profile
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

                await navigator.serviceWorker.getRegistrations().then(async registration => {
                   await registration[0].active.postMessage({ user:userData,data,authToken})
                    registration[0].sync.register('sync').then(() => console.log("Sync registered"))

                })

                this.$store.commit('storeupdatedRest')
                localStorage.setItem('time', Date.now())
            }
        }
    }
}