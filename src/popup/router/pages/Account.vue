<template>
  <div class="height-100 primary-bg">
    <div v-if="!isProviderPresent">
      <div class="popup popup-no-padding">
        <Loader v-if="loading" />
        <div v-if="!backedUpSeed && !tourRunning" class="noti" data-cy="seed-notif">
        </div>
        <div class="tour__step1">
          <AccountInfo />
          <BalanceInfo />
        </div>
        <div class="submenu-bg">
          
          <BoxButton :text="$t('pages.appVUE.profile')" to="/profile" style="font-size: smaller; color: white"
            class="tour__step9">
            <Profile width="24.5" height="24.5" slot="icon" />
          </BoxButton>

          <BoxButton :text="$t('pages.appVUE.Did')" to="/did">
            <DidIcon slot="icon" />
          </BoxButton>

          <BoxButton :text="$t('pages.appVUE.credential')" style="font-size: smaller; color: white" to="/credential"
            class="tour__step10">
            <Credential width="24.5" height="24.5" slot="icon" color="white" />
          </BoxButton>

          <BoxButton :text="$t('pages.appVUE.transfer')" to="/transfer" style="font-size: smaller; color: white"
            class="tour__step9">
            <Transfer height="24.5" slot="icon" />
          </BoxButton>

          <BoxButton :text="$t('pages.appVUE.myTransactions')" to="/transactions" style="font-size: smaller; color: white">
            <Transactions height="24.5" width="25" slot="icon" />
          </BoxButton>         

          <BoxButton :text="$t('pages.appVUE.settings')" to="/settings">
            <Settings slot="icon" />
          </BoxButton>

          


        </div>
        <!-- <RecentTransactions /> -->
        <div style="justify-content: center; display: flex">
          <button @click="scan" class="round-button" value="Scan Qr">
            <img src="../../../icons/qr-code-white.svg" class="round-button-qr" />
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <Loader v-if="loading" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Settings from '../../../icons/settings-icon.svg?vue-component';

import Profile from '../../../icons/profile.svg?vue-component';
import Transfer from '../../../icons/invite.svg?vue-component';
import Transactions from '../../../icons/hamburger.svg?vue-component';
import DidIcon from '../../../icons/claim-icon.svg?vue-component';

import Credential from '../../../icons/credential.svg?vue-component';
import QrIcon from '../../../icons/qr-code-white.svg?vue-component';
import AccountInfo from '../components/AccountInfo';
import BoxButton from '../components/BoxButton';
import axios from 'axios';
import { HS_AUTH_DID_URL } from '../../utils/hsConstants';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';


export default {
  name: 'Account',
  components: {
    QrIcon,
    Settings,
    AccountInfo,
    BoxButton,
    Credential,
    Profile,
    Transfer,
    Transactions,
    DidIcon,
  },
  data() {
    return {
      form: {
        url: '',
        amount: '',
      },
      credentialUrl: '',
      loading: false,
      verifiableCredential: {},
      hsAuthDid: "",
      isProviderPresent:  false,
    };
  },
  computed: {
    ...mapState(['tourRunning', 'backedUpSeed']),
    ...mapGetters(['hypersign']),
  },
  async created() {
    try {
      
      try{
        // For backward compatiblity
        // Make users loging if they have old did wallet. [did:hs]. So that they can create a new DID for our testnet, 
        if(this.hypersign.did.includes('did:hs')){
          console.log('Inside if check')
          await this.$store.dispatch('reset');
          await this.$router.push('/');
          this.$store.commit('setMainLoading', false);
          this.$store.commit('switchLoggedIn', false);
        } else {
          console.log('Inside else  check')
        }
      }catch(e){
        console.log(e.message)
      }
      

      const isRegisterFlow = localStorage.getItem("isRegisterFlow")
      if(isRegisterFlow){
        this.isProviderPresent = true;        
      }  

      // console.log("trying to Get 3rdPartyAuthVC")
      const vcStr = localStorage.getItem("3rdPartyAuthVC");
      if(vcStr){
        // console.log("vcStr is present");
        const vc = JSON.parse(vcStr);
        // console.log("Able to parse vcStr")
        if(vc){
          // console.log("Vc is not null");
          this.credentialsQRData(vc);
          return;
        }
      }
      
      // put it somewhere eles other whise it wont work... like somewhere when the app loads
      if (!this.hypersign.hsAuthDID) {
        const res = await axios.get(HS_AUTH_DID_URL);

        if(!res){
          throw new Error("Could not fetch auth did.")  
        }

        this.$store.commit('addHypersignAuthDid', res.data.message);
        this.hsAuthDid = res.data.message;
        
      } else {
        this.hsAuthDid = this.hypersign.hsAuthDID;
      }

      localStorage.setItem("isMobileWallet", false);
      //Only for deeplinking
      if (this.$route.query.url && this.$route.query.url != '') {        
        const JSONData = decodeURI(this.$route.query.url);
        this.receiveOrGiveCredential(JSONData);
      }


      
    } catch (e) {
      if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
    }
  },
  methods: {
    async scan() {
      localStorage.setItem("isMobileWallet", true)
      const QRData = await this.$store.dispatch('modals/open', {
        name: 'read-qr-code',
        title: this.$t('pages.credential.scan'),
      })

      if(QRData)
        this.receiveOrGiveCredential(QRData);
    },

    async receiveOrGiveCredential(QRJsonString){
      let data;
      try {
        data = JSON.parse(QRJsonString);
        // console.log(data);
        switch(data.QRType){
          case 'ISSUE_CRED': { // change it to ACCEPT_CRED
            this.credentialUrl = data.url;            
            let cred = await this.fetchCredential();
            this.credentialsQRData(cred);
            break;
          }
          case 'REQUEST_CRED': {
            this.credentialDetailsQRdata(data);
            break;
          }
          case 'ISSUE_SCHEMA':{ // sign schema and send to blockchain
            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push(`/schema`);
            break;
          }
          case 'ISSUE_CREDENTIAL': { // sign credentials and send to blockchain
            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push(`/signcredential`);
            break;
          }
          case 'ISSUE_DID': { // sign did and send to blockchain
            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push('/signdid');
            break;
          }
          default: {
            throw new Error('Invalid QR code type');
          }
        }
        
      } catch (e) {
        console.log(e);
        this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async fetchCredential() {      
      if(!this.credentialUrl){
        throw new Error("Credential Url is null or empty");
      }
      this.credentialUrl = this.credentialUrl + '&did=' + this.hypersign.did;
      this.loading = true;
      let response = await axios.get(this.credentialUrl);
      this.loading = false;
      if(response.status === 200){
        const { data } = response;
        if(!data){
          throw new Error('Some error occurred while accepting the credential');
        }
        return data;
      } else{
        throw new Error('Some error occurred while accepting the credential');
      }
    },

    async credentialsQRData(cred) {
      try {       
        if(!cred){
          throw new Error('Credential can not be null or empty');
        }
        // TODO: Check if this credential already exsits in wallet: otherwise reject
        const credInWallet = this.hypersign.credentials.find((x) => x.id == cred.id);
        if (credInWallet) {
          throw new Error('The credential already exist in your wallet');
        }

      
        // console.log({
        //   hs_app_did: this.hypersign.did,
        //   credentialSubjectDid: cred.credentialSubject.id
        // })
        
        // TODO: Check if you are the owner of this credenital: otherwise reject
        if (this.hypersign.did != cred.credentialSubject.id) {
          throw new Error('The credential is not issued to you');
        }        

        this.$store.commit('addHSVerifiableCredentialTemp', cred);
        this.$router.push(`/credential/temp/${cred.id}`);
        // localStorage.removeItem("3rdPartyAuthVC");
      } catch (e) {
        console.log(e);
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async credentialDetailsQRdata(qrData) {
      try {
        if (qrData == {}) throw new Error('Parsed QR data is empty');

        // TODO: verifying all fields
        const { appDid, schemaId } = qrData;

        if (!schemaId) throw new Error('Invalid schemaId');
        
        this.$store.commit('addRequestingAppInfo', qrData);
        this.verifiableCredential = this.hypersign.credentials.find((x) => {
          
          // hs:"http://localhost:1317/hypersign-protocol/hidnode/ssi/schema/did:hs:a58d3f48-7f29-47a9-ae73-a0800b409be7;id=e5419418-76e0-473b-8af8-09258bb2b761;version=1.0:"
          // http://localhost:1317/hypersign-protocol/hidnode/ssi/schema/did:hs:a58d3f48-7f29-47a9-ae73-a0800b409be7;id=e5419418-76e0-473b-8af8-09258bb2b761;version=1.0: 
          const credentialSchemaUrl = x['@context'][1].hs;
          const credentialSchemaId = getSchemaIdFromSchemaUrl(credentialSchemaUrl);

          if (credentialSchemaId === schemaId){
            if (x.issuer === appDid ){ // check if the app company issued this credential ;;  the registration flow
              return x;
            }

            if(x.issuer === this.hsAuthDid ){ // of the issuer is Hypersign Auth server? ;; without registration flow
              return x;
            }
          }
          // // if (x.issuer === appDid && credentialSchemaId === schemaId) return x; // we need to fix this later: should we not include x.issuer === appDid check as well?
          // if (credentialSchemaId === schemaId) return x; 
        });

        if (!this.verifiableCredential) throw new Error('Credential not found');
        
        this.$router.push(`/credential/authorize/${this.verifiableCredential.id}`);
      } catch (e) {
        console.log(e);
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

  
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.accountAddress {
  color: $white-color;
}

.paragraph {
  font-weight: normal;
}

.transactionHistory {
  margin-top: 1rem;
  width: 100%;
}

.recent-tx {
  margin-top: 130px;
  height: 500px;
  position: relative;
  z-index: 0;
}

.recent-tx .recent-transactions {
  overflow-y: scroll;
  padding-bottom: 20px;
}

.submenu-bg {
  background: $submenu-bg;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
}

.send-tips {
  margin-bottom: 26px;
}

.noti {
  margin-top: 20px;
  margin-bottom: 0;
  line-height: 14px;
}

.scan-text {
  margin-left: 10px;
  margin-bottom: 2px;
  // float: right;
}

.scanner {
  position: fixed;
  bottom: 0;
  width: 40%;
  border-radius: 49px;
}
</style>
