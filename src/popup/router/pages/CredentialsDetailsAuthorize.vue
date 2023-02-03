<template>
  <div class="popup">
    <div v-if="!isProviderPresent">
      <div class="">
        <div class="appInfo">
          <div class="row" style="  color: black;padding: 10px;border: 1px solid #8080801a;margin-bottom: 3%;border-radius: 5px;background: #80808026;">
            <div class="col-md-2" style="float: left;margin-right: 10px;">
              <img src='../../../icons/org.png' style="height: 40px;width: 40px;"/>
            </div>
            <div class="col-md-8" style="font-size: small; text-align: left;">
              <div style="font-weight: bold;"> {{hypersign.requestingAppInfo.appName}}</div>
              <div style="color: gray;" v-if="hypersign.requestingAppInfo.domain"> {{hypersign.requestingAppInfo.domain}}</div>
            </div>
          </div>
          <div class="row" style="color: black;text-align: left;word-break: break-word;font-size: small;">
            <div class="col-md-10" style="padding: 5px" v-if="hypersign.requestingAppInfo.reason">
              {{hypersign.requestingAppInfo.reason}}
            </div>
            <div class="col-md-10" style="padding: 5px" v-else>
              Requesting the following information to give you the service
            </div>
          </div>
          <!-- <p> Orgin <span style="font-style:oblique">{{hypersign.requestingAppInfo.domain ? hypersign.requestingAppInfo.domain: hypersign.requestingAppInfo.appName }}</span>
            is requesting information:</p> -->
        </div>


        <div class=""  style="max-height: 500px;overflow-y: scroll;">
          <div class="card" v-for="eachCred in credsDetials" style="overflow: unset;margin-bottom: 4%;">
            <div class="card-header" style="text-align: left; color: black;border: 1px solid #80808042;padding: 8px;border-radius: 5px;background: whitesmoke;">
               {{eachCred.formattedSchemaName}}</div>
            <div class="card-body" style="border: 1px solid #80808042;border-radius: 5px;">
              <ul class="list-group credential-item">
                <li class="list-group-item" v-for="claim in eachCred.claims" :key="claim">
                  <div class="list-title">{{ claim }}: </div>
                  <div>{{ eachCred.credentialSubject[claim] }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        
        
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
import { mapGetters, mapState } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VerifiedIcon from '../../../icons/badges/verified.svg?vue-component';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
import Url from 'url-parse';
import axios from 'axios';
import hidWalletInstance from '../../utils/hidWallet';
import {  HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE  } from '../../utils/hsConstants'



import {toFormattedDate, toStringShorner} from '../../utils/helper'
const HypersignSSISdk = require('hs-ssi-sdk');


export default {
  components: { QrIcon,CloseIcon,VerifiedIcon },
  data() {
    return {
      hsSDK: null,
      verifiableCredentials: [],
      credsDetials:[], 
      claims: [],
      loading: false,
      isProviderPresent: false,
    };
  },
  beforeDestroy() {
    this.reject()
  },
  async created() {
    await hidWalletInstance.generateWallet(this.mnemonic);
    this.hsSDK = new HypersignSSISdk(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
    await this.hsSDK.init();

    const credentialId = this.$route.params.credentialId;

    if (credentialId) {
      const credentialIdCommaSepStr = credentialId;
      let credIds = credentialIdCommaSepStr.split(',')
      
      if(credIds &&  credIds.length > 0){

        credIds = credIds.filter(x => x != null || x != '' || x != undefined)

        this.verifiableCredentials = this.hypersign.credentials.filter(x =>  credIds.indexOf(x.id) >= 0);
        if(!this.verifiableCredentials || this.verifiableCredentials.length <= 0){
            throw new Error('No credenital found')
        }

        this.verifiableCredentials.forEach(credential => {
          this.credsDetials.push({
            formattedExpirationDate: toFormattedDate(credential.expirationDate),
            formattedIssuanceDate: toFormattedDate(credential.issuanceDate),
            formattedIssuer: toStringShorner(credential.issuer, 32, 15),
            formattedSchemaName: credential.type[1],
            claims: Object.keys(credential.credentialSubject),
            credentialSubject: credential.credentialSubject
          })
        })        
      } else {
        console.error('No credIds passed')
        return;
      }
    }

    const isRegisterFlow = localStorage.getItem("isRegisterFlow")
    if(isRegisterFlow){
        this.isProviderPresent = true;
        this.authorize();
    }
  },
  computed: {
    ...mapGetters(['hypersign']),
    ...mapState(['mnemonic'])
  },
  methods: {    
    async authorize() {
      try {  
            let { serviceEndpoint, challenge } = this.hypersign.requestingAppInfo;
              
            const url = Url(serviceEndpoint, true);
            // TODO: need to remove this later. this is depreciated
            if(!challenge){
              challenge = url.query.challenge;
            }
            this.loading= true;
            const verifyUrl = url.origin + url.pathname;
            const vp_unsigned = await this.hsSDK.vp.getPresentation(
              {verifiableCredentials: this.verifiableCredentials,
              holderDid:  this.hypersign.did}
            );
            const verificationMethodId=this.hypersign.did + '#key-1';
            const vp_signed = await this.hsSDK.vp.signPresentation(
             { presentation: vp_unsigned,
                holderDidDocSigned: this.hypersign.didDoc,
                privateKey: this.hypersign.keys.privateKeyMultibase,
                challenge,
                verificationMethodId
              }
            );

            const body = {
              challenge,
              vp: JSON.stringify(vp_signed),
              holderDidDocSigned: JSON.stringify( this.hypersign.didDoc),
            };

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
  font-size: 13px;
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