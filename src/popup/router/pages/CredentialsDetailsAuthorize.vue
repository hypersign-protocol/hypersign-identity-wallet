<template>
  <div class="popup">
    <div v-if="!isProviderPresent">
      <div class="">
        <div class="appInfo">
          <p>This organisation <span style="font-style:oblique">{{hypersign.requestingAppInfo.appName}}</span>
          is requesting the following information.</p>
        </div>
        <ul class="list-group credential-item">
          <li class="list-group-item" v-for="claim in claims" :key="claim">
            <div class="list-title">{{ claim }}: </div>
            <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
          </li>
        </ul>
        <Loader v-if="loading" />
      </div>
      <div class="scanner d-flex">
        <Button class="scan"  data-cy="scan-button" @click="authorize">
          <VerifiedIcon width="20" height="20" class="scan-icon"/><span class="scan-text">{{ $t('pages.credential.authorize') }}</span>
        </Button>
      </div>
      <div class="scanner d-flex">
        <Button class="scan"  data-cy="scan-button" @click="reject">
          <CloseIcon width="20" height="20" class="scan-icon"/><span class="scan-text">{{ $t('pages.credential.decline') }}</span>
        </Button>
      </div>
    </div>
    <div v-else>
      <Loader v-if="loading" />
      Presenting Your Credential...
    </div>
    
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VerifiedIcon from '../../../icons/badges/verified.svg?vue-component';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
import Url from 'url-parse';
import axios from 'axios';
import { createHidWallet } from '../../utils/hidWallet';
import {toFormattedDate, toStringShorner} from '../../utils/helper'
import HypersignSSISdk from 'hs-ssi-sdk';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';

export default {
  components: { QrIcon,CloseIcon,VerifiedIcon },
  data() {
    return {
      hsSDK: null,
      verifiableCredential: {},
      claims: [],
      loading: false,
      credDetials: {
        formattedIssuer: "",
        formattedExpirationDate: "",
        formattedIssuanceDate: "",
        formattedSchemaName: ""
      },
      isProviderPresent: false,
    };
  },
  beforeDestroy() {
    this.reject()
  },
  async created() {
    this.mnemonic = "retreat seek south invite fall eager engage endorse inquiry sample salad evidence express actor hidden fence anchor crowd two now convince convince park bag"
      const offlineSigner = await createHidWallet(this.mnemonic);
    this.hsSDK = new HypersignSSISdk(offlineSigner, "http://localhost:26657", "http://localhost:1317");
    await this.hsSDK.init();

    const credentialId = this.$route.params.credentialId;
    console.log(credentialId)
    if (credentialId) {
      this.verifiableCredential = this.hypersign.credentials.find(x => x.id == credentialId);
      if(!this.verifiableCredential){
        throw new Error('No credenital foud with id - ' + credentialId)
      }
      console.log(this.verifiableCredential)

      this.credDetials.formattedExpirationDate = toFormattedDate(this.verifiableCredential.expirationDate) ;
      this.credDetials.formattedIssuanceDate = toFormattedDate(this.verifiableCredential.issuanceDate) ;
      this.credDetials.formattedIssuer =  toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName =  this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }

    const isRegisterFlow = localStorage.getItem("isRegisterFlow")
    if(isRegisterFlow){
        this.isProviderPresent = true;
        this.authorize();
    }
  },
  computed: {
    ...mapGetters(['hypersign']),
  },
  methods: {    
    async authorize() {
      try {
        const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
        const credentialSchemaId = getSchemaIdFromSchemaUrl(credentialSchemaUrl);

        
            let { serviceEndpoint, schemaId, challenge } = this.hypersign.requestingAppInfo;
            if(schemaId != credentialSchemaId) throw new Error('Invalid credential request: Requesting schema does not exist. Make sure you register first to get credential');
            const url = Url(serviceEndpoint, true);
            // TODO: need to remove this later. this is depreciated
            if(!challenge){
              challenge = url.query.challenge;
            }
            this.loading= true;
            const verifyUrl = url.origin + url.pathname;
            const vp_unsigned = await this.hsSDK.vp.getPresentation(
              {verifiableCredential: this.verifiableCredential,
              holderDid:  this.hypersign.did}
            );

            console.log(
              { presentation: vp_unsigned,
               holderDid: this.hypersign.did,
               privateKey: this.hypersign.keys.privateKeyMultibase,
               challenge
              }
            )
          

            const vp_signed = await this.hsSDK.vp.signPresentation(
             { presentation: vp_unsigned,
               holderDid: this.hypersign.did,
               privateKey: this.hypersign.keys.privateKeyMultibase,
               challenge
              }
            );

            // console.log('Signed vp created..');
            const body = {
              challenge,
              vp: JSON.stringify(vp_signed),
            };


            console.log({
              verifyUrl,
              body
            })

             await this.$store.dispatch('modals/open', {
                name: 'default',
                msg: 'Credential successfully verified. Go back to the application.',
              });

              return

            const response = await axios.post(verifyUrl, body);
            if(response.status === 200){
              const isMobileWallet = JSON.parse(localStorage.getItem("isMobileWallet"));
              if(!isMobileWallet){
                return window.close();
              }
              await this.$store.dispatch('modals/open', {
                name: 'default',
                msg: 'Credential successfully verified. Go back to the application.',
              });
            } else {
              throw new Error("Could not authorize the user. Reload the login page and try again")
            }
          
      } catch (e) {
        if (e.message) {
          if(e.message.indexOf(401) >= 0 || e.message.indexOf(403) >= 0){
            this.$store.dispatch('modals/open', { name: 'default', msg: "Could not authorize the user. Reload the login page and try again" })  
          } else {
            this.$store.dispatch('modals/open', { name: 'default', msg: e.message })
          }
        }
      } finally {
        this.loading=false;
        this.reject();
      }
    },
    async reject () {
      this.$store.commit('clearRequestingAppInfo');
      this.$router.push('/account');
      localStorage.removeItem("qrDataQueryUrl");
      localStorage.removeItem("3rdPartyAuthVC");
      localStorage.removeItem("isRegisterFlow")
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';
.cred-card-body {
  padding-left: 10px;
  margin-top: 27%;
  padding-bottom: 5%;
}

.scan { 
  border-radius: 49px;
  text-align: center;
}
.scanner {
  bottom:15px;
  width: 50%;
  border-radius: 49px;
}
.cred-card {
  background: #21222a !important;
  box-shadow: 0 0 8px rgba(0, 33, 87, 0.15);
  border-radius: 14px;
  margin-top: 7%;
  text-align: left;
  font-size: small;
  color: gray;
  padding-top: 7%;
}
.cred-card-header {
  color: #fff;
  border-bottom: 1px solid #80808061;
  border-top: 1px solid gray;
  background-color: #808080f0;
  font-size: larger;
  text-align: right;
  padding-right: 8px;
}

.list-title {
  color: $text-color;
  font-size: 12px;
  text-transform:capitalize;
}


.list-group {
  padding: 0 !important;
  margin-top: 30px;
}

.list-group-item {
  text-decoration: none;
  transition: 0.4s;
  position: relative;
  padding: 1rem 1.5rem;
  width: 100%;
  display: block;
  font-size: 12px;
  border-bottom: 1px solid #cccccc2e;
  text-align: left;
  border-left: 2px solid transparent;
  color: gray;
}

.d-flex {
  display: flex;
  float: right;
  padding: 5px;
}
.withdraw.step1 {
  textarea {
    width: 250px;
    min-height: 60px !important;
    margin: 0 20px 0 0;
    font-size: 11px;
  }

  small {
    color: $accent-color;
    display: block;
    width: 100%;
    padding-top: 5px;
    font-size: 12px;
  }
}

.withdraw.step2 {
  p {
    display: flex;
    justify-content: center;
    line-height: 2rem;
  }

  p:not(:first-of-type) {
    color: $text-color;
  }

  p > svg {
    margin-right: 10px;
  }

  .info-group {
    text-align: left;
    display: block;
    margin: 20px 0;

    .info-label {
      display: block;
      padding: 10px 0;
    }

    .info-span {
      color: $accent-color;
      font-size: 11px;
      display: inline-block;
      width: 300px;
      white-space: nowrap;
      // overflow: hidden !important;
      // text-overflow: ellipsis;
      letter-spacing: -0.3px;
      cursor: pointer;
    }

    .amount {
      font-size: 26px;
      color: $secondary-color;
    }

    .currencyamount {
      font-size: 18px;
      display: block;

      span {
        font-size: 18px;
      }
    }
  }

  .text-center {
    text-align: center;
  }
}
</style>