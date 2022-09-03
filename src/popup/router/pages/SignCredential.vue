
<template>
  <div class="popup">
    <div>
      <div class="">
        <div class="appInfo">
          <p>This organisation <span style="font-style:oblique">{{hypersign.requestingAppInfo.appName}}</span>
            is requesting to sign the following</p>
          <p>{{ JSON.stringify(this.credentialRaw) }}</p>
        </div>
      </div>
      <div class="scanner d-flex">
        <Button class="scan"  data-cy="scan-button" @click="signAndSendToBlockchain()">
          <VerifiedIcon width="20" height="20" class="scan-icon"/><span class="scan-text">{{ $t('pages.credential.authorize') }}</span>
        </Button>
      </div>
      <div class="scanner d-flex">
        <Button class="scan"  data-cy="scan-button" @click="reject()">
          <CloseIcon width="20" height="20" class="scan-icon"/><span class="scan-text">{{ $t('pages.credential.decline') }}</span>
        </Button>
      </div>
    </div>
    <Loader v-if="loading" />    
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import hidWalletInstance from '../../utils/hidWallet';
const HypersignSSISdk = require('hs-ssi-sdk');
import { HIDNODE_RPC, HIDNODE_REST  } from '../../utils/hsConstants';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VerifiedIcon from '../../../icons/badges/verified.svg?vue-component';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
import axios from 'axios';

export default {

    name: 'IssueSchema',
    computed: {
        ...mapGetters(['hypersign']),
        ...mapState(['mnemonic'])
    },
    components: { QrIcon,CloseIcon,VerifiedIcon },
    beforeDestroy() {
        this.reject()
    },
    data() {
        return {
            hsSDK: null,
            loading:  false,
            credentialRaw: ''
        }
    },
    async created(){
        // get the schemadata to sign from route
        /*
{
  "QRType": "ISSUE_CREAD",
  "serviceEndpoint": "https://stage.hypermine.in/studioserver/api/v1/credential/status/63076332a6812f5ce9209095",
  "schemaId": "",
  "appDid": "",
  "appName": "Hypersign Studio",
  "challenge": "",
  "provider": "",
  "data": {
    "fields": {
      "Name": "Pratap Mridha",
      "Email": "pratapmridha@gmail.com",
      "Phone No": "8293775017"
    },
    "schemaId": "did:hs:zBrKp2nQvmYLqiMtqy1Guc7PEsqGDiMRPZVEw2ocTS7Us;id=fedaeb1b-45f3-4bde-b57b-e484d8d93d5e;version=1.0",
    "issuerDid": "did:hs:zBrKp2nQvmYLqiMtqy1Guc7PEsqGDiMRPZVEw2ocTS7Us",
    "subjectDid": "did:hs:z7N1g3x7vHkwXPH8DjPoNyyQoxndhqXLjpwqARmQz9iW5"
  }
}
*/        
        this.credentialRaw = this.hypersign.requestingAppInfo.data;
        await hidWalletInstance.generateWallet(this.mnemonic);
        this.hsSDK = new HypersignSSISdk(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST);
        await this.hsSDK.init();
        // await this.signAndSendToBlockchain();
    },
    methods: {
        async reject () {
            this.$store.commit('clearRequestingAppInfo');
            this.$router.push('/account');
        },
        async prepareCredential(){
            // using hs-ssi-sdk to g
            const schemaOptions = this.credentialRaw; 
            const { fields,  subjectDid, schemaId, expirationDate } = this.credentialRaw;
            if(!fields){
                throw new Error('field is missing')
            }

            if(!subjectDid){
                throw new Error('subject did is missing')
            }
            
            if(!schemaId){
                throw new Error('schemaId is missing')
            }

            if(!expirationDate){
                throw new Error('expirationDate is missing')
            }

            return await this.hsSDK.vc.getCredential({
                schemaId,
                subjectDid ,
                issuerDid: this.hypersign.did,
                expirationDate,
                fields
            })
        },
        async signAndSendToBlockchain(){
            try{
                this.loading = true;
                const vc = await this.prepareCredential();
                                
                const result = await this.hsSDK.vc.issueCredential({
                    credential: vc,
                    issuerDid: this.hypersign.did,
                    privateKey: this.hypersign.keys.privateKeyMultibase
                })

                if (result) {
                    this.$store.dispatch('modals/open', { name: 'default', msg: 'Successfully Issued Credential' });
                    /// call the sutatus API of the studio/dappp server to for updating the status in db.
                    const { serviceEndpoint } = this.hypersign.requestingAppInfo;
                    if(serviceEndpoint){
                        try{
                            const body = {
                                transactionHash:  result.transactionHash,
                                vc,
                            }
                            axios.post(serviceEndpoint, body).then(response => {
                                if(response && response.status === 200){
                                    console.log('Successfully sent result to serviceEndpoint')
                                } else {
                                    console.log("Could not sent result to serviceEndpoint")
                                }
                            }).catch(e => {
                                console.error(e)    
                            })
                            
                        }catch(e){
                            console.error(e)
                            this.loading = false;
                        }
                        
                    }else{
                        console.log('No serviceEndpoint available.')
                    }
                }
            }catch(e){
                console.log(e)
                this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
            } finally {
                this.loading = false;
                this.reject();
            }
        }
    }

}

</script>