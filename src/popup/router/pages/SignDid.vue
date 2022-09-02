
<template>
  <div class="popup">
    <div>
      <div class="">
        <div class="appInfo">
          <p>This organisation <span style="font-style:oblique">{{hypersign.requestingAppInfo.appName}}</span>
          is requesting the following information.</p>
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
  QRType: 'ISSUE_DID',
  serviceEndpoint: 'https://stage.hypermine.in/studioserver/api/v1/org/status/6311dfe821773d0fa79ba0f7',
  schemaId: '',
  appDid: '',
  appName: 'Hypersign Studio',
  challenge: '',
  provider: '',
  data: {
    userDid: 'did:hs:zERsQiJV5PCDaLqr7WLtpjJSCx5Euq4xJB7MLQmcKzrqy',
    orgDid: '',
    region: 'US EAST',
    name: 'Hypermine Pvt Ltd',
    domain: 'hypermine.in',
    logo: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.5EZ51foyo3QBV2FHnKq1cwHaEc%26pid%3DApi&f=1',
    status: undefined
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
       
        async signAndSendToBlockchain(){
            try{
                this.loading = true;

                
                        
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