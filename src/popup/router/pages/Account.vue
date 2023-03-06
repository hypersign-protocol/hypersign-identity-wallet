<template>
  <div class="height-100 primary-bg">
    <div v-if="!isProviderPresent">
      <div class="popup popup-no-padding">
        <Loader v-if="loading" />
        <div v-if="!backedUpSeed && !tourRunning" class="noti" data-cy="seed-notif">
        </div>
        <div class="tour__step1">
          <AccountInfo />
          <!-- <BalanceInfo /> -->
        </div>
        <div class="submenu-bg">
          <div class="box-club">

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


          </div>



          <div class="box-club">


            <BoxButton :text="$t('pages.appVUE.transfer')" to="/transfer" style="font-size: smaller; color: white"
              class="tour__step9">
              <Transfer height="24.5" slot="icon" />
            </BoxButton>

            <BoxButton :text="$t('pages.appVUE.myTransactions')" to="/transactions"
              style="font-size: smaller; color: white">
              <Transactions height="24.5" width="25" slot="icon" />
            </BoxButton>

            <BoxButton :text="$t('pages.appVUE.settings')" to="/settings">
              <Settings slot="icon" />
            </BoxButton>


          </div>





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
import DidIcon from '../../../icons/activity-icon.svg?vue-component';

import Credential from '../../../icons/credential.svg?vue-component';
import QrIcon from '../../../icons/qr-code-white.svg?vue-component';
import AccountInfo from '../components/AccountInfo';
import BalanceInfo from '../components/BalanceInfo';
import BoxButton from '../components/BoxButton';
import { didResolver } from '../../utils/resolver'
import axios from 'axios';
import verifyTokenMixin from '../../../mixins/verifyTokenMixin';
import { HS_AUTH_DID_URL } from '../../utils/hsConstants';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import syncMixin from '../../../mixins/syncMixin'
import removeAccountMixin from '../../../mixins/removeAccount';

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
    BalanceInfo
  },
  data() {
    return {
      worker: undefined,
      form: {
        url: '',
        amount: '',
      },
      credentialUrl: '',
      loading: false,
      verifiableCredential: {},
      hsAuthDid: "",
      isProviderPresent: false,
      verifiableCredentials: []
    };
  },
  mixins: [syncMixin, verifyTokenMixin,removeAccountMixin],
  computed: {
    ...mapState([, 'tourRunning', 'backedUpSeed']),
    ...mapGetters(['hypersign']),
  },

  async created() {
    try {

      try {


        // For backward compatiblity
        // Make users loging if they have old did wallet. [did:hs]. So that they can create a new DID for our testnet, 


        if (this.hypersign.did.includes('did:hs')) {
          console.log('Inside if check')
          await this.$store.dispatch('reset');
          await this.$router.push('/');
          localStorage.removeItem('authToken')

          this.$store.commit('setMainLoading', false);
          this.$store.commit('switchLoggedIn', false);
        } else {
          console.log('Inside else  check')
        }

        const qrDataQueryUrl=localStorage.getItem('qrDataQueryUrl')
        this.verifyToken()
          .then(data => {
            if (data !== undefined) {
              const response = data.response
              if (response.status === 401) {         
                localStorage.setItem('qrDataQueryUrl',qrDataQueryUrl)
                this.$store.commit('setMainLoading', false);
                this.$store.commit('switchLoggedIn', false);
                this.removeAccountSilent()

              }
            }
          })

          console.log();

      } catch (e) {
        console.log(e.message)
      }

      const isRegisterFlow = localStorage.getItem("isRegisterFlow")
      if (isRegisterFlow) {
        this.isProviderPresent = true;
      }

      // console.log("trying to Get 3rdPartyAuthVC")
      const vcStr = localStorage.getItem("3rdPartyAuthVC");
      if (vcStr) {
        // console.log("vcStr is present");
        const vc = JSON.parse(vcStr);
        // console.log("Able to parse vcStr")
        if (vc) {
          // console.log("Vc is not null");
          this.credentialsQRData(vc);
          return;
        }
      }

      // put it somewhere eles other whise it wont work... like somewhere when the app loads
      if (!this.hypersign.hsAuthDID) {
        const res = await axios.get(HS_AUTH_DID_URL);

        if (!res) {
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

      if (QRData)
        this.receiveOrGiveCredential(QRData);
    },
    isPrivateDid() {
      const didList = this.hypersign.dids
      let status
      Object.values(didList).forEach((did) => {
        if (did.didDoc.id === this.hypersign.did) {
          status = did.status

        }
      })
      return status === 'private' ? true : false;
    },

    async receiveOrGiveCredential(QRJsonString) {
      let data;
      try {
        data = JSON.parse(QRJsonString);
        // console.log(data);
        switch (data.QRType) {
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
          case 'ISSUE_SCHEMA': { // sign schema and send to blockchain
            if (this.isPrivateDid()) {
              const selection = await this.$store
                .dispatch('modals/open', {
                  name: 'confirm',
                  title: this.$t('modals.changeDid.title'),
                  msg: this.$t('modals.changeDid.msg'),

                }).catch(() => false);
              if (selection) {
                this.$emit('closeMenu');
                this.$router.push(`/did`);
                return
              } else {
                throw new Error('Sorry, Selected DID is private. Please select a public DID to issue Schema')
              }
            }
            const orgDid = data.data.author
            const resolvedDidDoc = await didResolver(orgDid)
            const { didDocument } = resolvedDidDoc
            const { controller } = didDocument
            if (!controller.includes(this.hypersign.did)) {
              throw new Error('Sorry, You are not the controller of this DID. Please select a DID which is controller of this DID to issue Schema')
            }
            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push(`/schema`);
            break;
          }
          case 'ISSUE_CREDENTIAL': { // sign credentials and send to blockchain            
            if (this.isPrivateDid()) {
              const selection = await this.$store
                .dispatch('modals/open', {
                  name: 'confirm',
                  title: this.$t('modals.changeDid.title'),
                  msg: this.$t('modals.changeDid.msg'),

                }).catch(() => false);
              if (selection) {
                this.$emit('closeMenu');
                this.$router.push(`/did`);
                return
              } else {
                throw new Error('Sorry, Selected DID is private. Please select a public DID to issue credential')
              }
            }
            const orgDid = data.data.issuerDid
            const resolvedDidDoc = await didResolver(orgDid)
            const { didDocument } = resolvedDidDoc
            if (didDocument === null) {
              throw new Error('Sorry, Issuer DID is not registered on blockchain. Please select a DID which is registered on blockchain to issue credential')
            }
            const { controller } = didDocument
            if (!controller.includes(this.hypersign.did)) {
              throw new Error('Sorry, You are not the controller of this DID. Please select a DID which is controller of this DID to issue credential')
            }

            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push(`/signcredential`);
            break;
          }
          case 'ISSUE_DID': { // sign did and send to blockchain

            if (this.isPrivateDid()) {

              const selection = await this.$store
                .dispatch('modals/open', {
                  name: 'confirm',
                  title: this.$t('modals.changeDid.title'),
                  msg: this.$t('modals.changeDid.msg'),

                }).catch(() => false);
              if (selection) {
                this.$emit('closeMenu');
                this.$router.push(`/did`);
                return
              } else {
                throw new Error('Sorry, Selected DID is private. Please select a public DID to issue Did')
              }
            }
            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push('/signdid');
            break;
          }
          case 'UPDATE_DID': { // sign did and send to blockchain
            if (this.isPrivateDid()) {
              const selection = await this.$store
                .dispatch('modals/open', {
                  name: 'confirm',
                  title: this.$t('modals.changeDid.title'),
                  msg: this.$t('modals.changeDid.msg'),

                }).catch(() => false);
              if (selection) {
                this.$emit('closeMenu');
                this.$router.push(`/did`);
                return
              } else {
                throw new Error('Sorry, Selected DID is private. Please select a public DID to update Did')
              }
            }
            this.$store.commit('addRequestingAppInfo', data);
            this.$router.push('/updatedid');
            break;
          }
          default: {
            throw new Error('Invalid QR code type');
          }
        }

      } catch (e) {
        // console.log(e);
        this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async fetchCredential() {
      if (!this.credentialUrl) {
        throw new Error("Credential Url is null or empty");
      }
      this.credentialUrl = this.credentialUrl + '&did=' + this.hypersign.did;
      this.loading = true;
      let response = await axios.get(this.credentialUrl);
      this.loading = false;
      if (response.status === 200) {
        const { data } = response;
        if (!data) {
          throw new Error('Some error occurred while accepting the credential');
        }
        return data;
      } else {
        throw new Error('Some error occurred while accepting the credential');
      }
    },

    async credentialsQRData(cred) {
      try {
        if (!cred) {
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

        this.$store.dispatch('addHSVerifiableCredentialTemp', cred);
        this.$router.push(`/credential/temp/${cred.id}`);
        // localStorage.removeItem("3rdPartyAuthVC");
      } catch (e) {
        // console.log(e);
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async credentialDetailsQRdata(qrData) {
      try {

        /**Sample QR data; It sould be called presenation query */
        /*
        {
            "QRType": "REQUEST_CRED",
            "serviceEndpoint": "https://stage.hypermine.in/whitelist/hs/api/v2/auth",
            "schemaId": "sch:hid:testnet:z12GNMh8pWFnY4wN1evLaQ52gwD8Be4VKstKSriVEnpe8:1.0", // this can either contain 1 schema or multiple schemas. this can be a string field or an array field.
            "appDid": "did:hid:testnet:z7HAgbm3m9KKBEC8CxWuJoWmDnUs9Snr3QNxdRPtD1u4G",
            "appName": "Hypersign Auth",
            "challenge": "d900f8af-68be-4151-bfd0-1e2113f6fa7c",
            "domain": "https://localhost:123"  // optional for time being ..  this should be mandatory to check if some attacker has not stollen the challenge of a legit 
                          // domain and not trying to perform reply attacks
          }
        */

        if (qrData == {}) throw new Error('Parsed QR data is empty');

        // TODO a requete may want to request multiple schemas...
        // But we need to properly implement presentation request specification
        // https://w3c-ccg.github.io/vp-request-spec/#step-2-notification-response
        const { appDid, schemaId } = qrData;

        if (!schemaId) throw new Error('Invalid schemaId');

        this.$store.commit('addRequestingAppInfo', qrData);

        if (Array.isArray(schemaId)) {
          //// Doc: more than one credentials are requested 
          //// All schemas must exists, otherwise it will fail 
          const schemaIds = schemaId;
          const credentialSchemasIds = this.hypersign.credentials.map(x => getSchemaIdFromSchemaUrl(x['@context'][1].hs))
          // console.log({
            // credentialSchemasIds
          // })

          if (this.hypersign.credentials <= 0) {
            throw new Error('No credential found');
          }

          const intersectionSchemasIds = credentialSchemasIds.filter(x => schemaIds.indexOf(x) > -1)

          if (intersectionSchemasIds.length <= 0) {
            throw new Error('Credential not found for schemaIds ' + schemaId.join(','))
          }

          if (intersectionSchemasIds.length !== schemaIds.length) {
            const rest = schemaIds.filter(x => intersectionSchemasIds.indexOf(x) < 0)
            throw new Error('Credential not found for schemaIds ' + rest ? rest.join(',') : '')
          }

          this.verifiableCredentials = this.hypersign.credentials.filter(x => {
            const credentialSchemaUrl = x['@context'][1].hs;
            const credentialSchemaId = getSchemaIdFromSchemaUrl(credentialSchemaUrl);
            if (intersectionSchemasIds.indexOf(credentialSchemaId) >= 0) {
              return x;
            }
          })

          if (this.verifiableCredentials.length <= 0) {
            throw new Error('Credential not found')
          }

          const filteredCredentialIds = this.verifiableCredentials.map(x => x.id);

          // console.log({
          //   filteredCredentialIds
          // })

          this.$router.push(`/credential/authorize/${filteredCredentialIds.join(',')}`);
        } else {
          //// Doc: else not interpting the existing flow

          // Here we are searching the wallet for credential
          this.verifiableCredential = this.hypersign.credentials.find((x) => {
            const credentialSchemaUrl = x['@context'][1].hs;
            const credentialSchemaId = getSchemaIdFromSchemaUrl(credentialSchemaUrl);

            if (credentialSchemaId === schemaId) {
              if (x.issuer === appDid) { // check if the app company issued this credential ;;  the registration flow
                return x;
              }

              if (x.issuer === this.hsAuthDid) { // of the issuer is Hypersign Auth server? ;; without registration flow
                return x;
              }
            }
            // // if (x.issuer === appDid && credentialSchemaId === schemaId) return x; // we need to fix this later: should we not include x.issuer === appDid check as well?
            // if (credentialSchemaId === schemaId) return x; 
          });

          // If not, we throw an error
          if (!this.verifiableCredential) throw new Error('Credential not found');

          this.$router.push(`/credential/authorize/${this.verifiableCredential.id}`);
        }



      } catch (e) {
        // console.log(e);
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

.box-club {
  padding: 1px;
  border: 1px solid #80808052;
  width: 100%;
  border-radius: 5px;
  margin-top: 1%;
}
</style>
