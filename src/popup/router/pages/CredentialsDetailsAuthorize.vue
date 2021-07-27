<template>
  <div class="popup">
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
    <!-- <div class="scanner d-flex">
      <div class="scan" data-cy="scan-button" @click="scan">
        <QrIcon width="20" height="20" /><span class="scan-text">{{ $t('pages.credential.scan') }}</span>
      </div>
    </div> -->
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VerifiedIcon from '../../../icons/badges/verified.svg?vue-component';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
import Url from 'url-parse';
import axios from 'axios';
import { hypersignSDK } from '../../utils/hypersign';
import {toFormattedDate, toStringShorner} from '../../utils/helper'

export default {
  components: { QrIcon,CloseIcon,VerifiedIcon },
  data() {
    return {
      verifiableCredential: {},
      claims: [],
      loading: false,
      credDetials: {
        formattedIssuer: "",
        formattedExpirationDate: "",
        formattedIssuanceDate: "",
        formattedSchemaName: ""
      }
    };
  },
  beforeDestroy() {
    this.reject()
  },
  created() {
    const credentialId = this.$route.params.credentialId;
    if (credentialId) {
      this.verifiableCredential = this.hypersign.credentials.find(x => x.id == credentialId);
      this.credDetials.formattedExpirationDate = toFormattedDate(this.verifiableCredential.expirationDate) ;
      this.credDetials.formattedIssuanceDate = toFormattedDate(this.verifiableCredential.issuanceDate) ;
      this.credDetials.formattedIssuer =  toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName =  this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }
  },
  computed: {
    ...mapGetters(['hypersign']),
  },
  methods: {    
    async authorize() {
      try {
        const credentialSchemaUrl = this.verifiableCredential['@context'][1].hsscheme;
        const credentialSchemaId = credentialSchemaUrl.substr(credentialSchemaUrl.indexOf("sch_")).trim();
            const { serviceEndpoint, schemaId } = this.hypersign.requestingAppInfo;
            if(schemaId != credentialSchemaId) throw new Error('Invalid credential request: Requesting schema does not exist. Make sure you register first to get credential');
            const url = Url(serviceEndpoint, true);
            const challenge = url.query.challenge;
            this.loading= true;
            const verifyUrl = url.origin + url.pathname;
            const vp_unsigned = await hypersignSDK.credential.generatePresentation(
              this.verifiableCredential,
              this.hypersign.did,
            );
          
            const vp_signed = await hypersignSDK.credential.signPresentation(
              vp_unsigned,
              this.hypersign.did,
              this.hypersign.keys.privateKeyBase58,
              challenge,
            );

            // console.log('Signed vp created..');
            const body = {
              challenge,
              vp: JSON.stringify(vp_signed),
            };

            let response = await axios.post(verifyUrl, body);
            // console.log(response)
            response = response.data;
          

            if (!response) throw new Error('Could not verify the presentation');
            if(response.status == 401 || response.status == 403) {
              throw new Error('Could not authorize the user')
            }else if(response.status == 200){
            if (response.message)
            await this.$store.dispatch('modals/open', {
                name: 'default',
                msg: 'Credential successfully verified',
              });
            this.reject()
            }else {
              throw new Error(response.error)
            }
            
        // }
        this.loading=false;
      } catch (e) {
        this.loading=false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
        this.reject()
      }
    },
    async reject () {
      this.$store.commit('clearRequestingAppInfo');
      this.$router.push('/account')
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