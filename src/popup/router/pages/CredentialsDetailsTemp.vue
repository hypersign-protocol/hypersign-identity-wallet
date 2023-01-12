<template>
  <div class="popup">
    <div v-if="!isProviderPresent">
      <div class="">
        <div class="cred-card">
          <div class="cred-card-header">
            <span>{{ credDetials.formattedSchemaName }}</span>
          </div>
          <div class="cred-card-body">
            <span class="cred-card-body-detail">SCHEMA ID: {{ credDetials.schemaId }}</span><br />
            <span class="cred-card-body-detail">ISSUER ID: {{ credDetials.formattedIssuer }}</span><br />
            <span class="cred-card-body-detail">ISSUED ON: {{ credDetials.formattedIssuanceDate }}</span><br />
          </div>
        </div>
        <ul class="list-group credential-item">
          <li class="list-group-item" v-for="claim in claims" :key="claim">
            <div class="list-title">{{ toUpper(claim) }}: </div>
            <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
          </li>
        </ul>
        <Loader v-if="loading" />
      </div>
      <div class="scanner d-flex">
        <Button class="scan" data-cy="scan-button" @click="acceptCredential">
          <VerifiedIcon width="20" height="20" class="scan-icon" /><span class="scan-text">{{
            $t('pages.credential.accept')
          }}</span>
        </Button>
      </div>
      <div class="scanner d-flex">
        <Button class="scan" data-cy="scan-button" @click="rejectCredential">
          <CloseIcon width="20" height="20" class="scan-icon" /><span class="scan-text">{{
            $t('pages.credential.reject')
          }}</span>
        </Button>
      </div>
    </div>
    <div v-else>
      <Loader v-if="loading" />
      Storing Your Credential...
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VerifiedIcon from '../../../icons/badges/verified.svg?vue-component';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
import { toFormattedDate, toStringShorner } from '../../utils/helper'
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import edvService from '../../utils/edvService';
import { HS_VC_STATUS_PATH, HS_VC_STATUS_CHECK_ATTEMPT, HS_VC_STATUS_CHECK_INTERVAL } from '../../utils/hsConstants';
import Axios from 'axios';
import syncSwMixin from '../../../mixins/syncSwMixin';
import initiateWorker from '../registerServiceWorker';
export default {
  components: { QrIcon, CloseIcon, VerifiedIcon },
  data() {
    return {
      count: 0,
      iteration: 0,
      verifiableCredential: {},
      claims: [],
      loading: false,
      accepted: false,
      isProviderPresent: false,
      credDetials: {
        formattedIssuer: "",
        formattedExpirationDate: "",
        formattedIssuanceDate: "",
        formattedSchemaName: "",
        schemaId: ""
      }
    };
  },
  beforeDestroy() {
    if (!this.accepted) this.rejectCredential()
  },
  created() {

    this.count = HS_VC_STATUS_CHECK_ATTEMPT
    this.iteration = 0
    const credentialId = this.$route.params.credentialId;
    if (credentialId) {
      this.verifiableCredential = this.hypersign.credentialsTemp.find(x => x.id == credentialId);
      if (!this.verifiableCredential) this.rejectCredential()
      this.credDetials.formattedExpirationDate = toFormattedDate(this.verifiableCredential.expirationDate);
      this.credDetials.formattedIssuanceDate = toFormattedDate(this.verifiableCredential.issuanceDate);
      this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
      this.credDetials.schemaId = toStringShorner(getSchemaIdFromSchemaUrl(credentialSchemaUrl).trim(), 32, 15);
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }

    const isRegisterFlow = localStorage.getItem("isRegisterFlow")
    if (isRegisterFlow) {
      this.isProviderPresent = true;
      this.acceptCredential();
    }
  },
  mixins:[syncSwMixin],
  computed: {
    ...mapGetters(['hypersign','password']),


  },
  methods: {
    toUpper(t) {
      if (t)
        return t.toString().toUpperCase();
      else
        return t;
    },
    async delay(delayInms) {
      return new Promise(resolve => setTimeout(resolve, delayInms));
    }
    ,
    async checkStatus(verifiableCredential) {
      if (this.iteration > this.count) {
        this.loading = false;
        this.$router.push('/account');
        return;
      }
      this.iteration += 1;
      let res
      try {
        res = await Axios.get(`${HS_VC_STATUS_PATH}/${verifiableCredential.id}`);


      } catch (error) {
        if (error.response.data.error !== null) {
          this.$store.dispatch('modals/open', { name: 'default', msg: error.response.data.error })
          this.$router.push('/account');
          return;
        }
        await this.delay(HS_VC_STATUS_CHECK_INTERVAL);
        return await this.checkStatus(verifiableCredential);

      }
      if (res.data.vc.credStatus.claim.currentStatus == "Live") {

        this.accepted = true;

      }
      return res

    },


    async acceptCredential() {


      this.loading = true;
      try {

        this.credStatus = await this.checkStatus(this.verifiableCredential);
        console.log(this.credStatus);
        if (this.credStatus == undefined) {
          this.$store.dispatch('modals/open', { name: 'default', msg: "Credential Status not found." })
          const vc = JSON.stringify(this.verifiableCredential)
          localStorage.setItem("3rdPartyAuthVCUnregistred", vc)
          return
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.$store.dispatch('modals/open', { name: 'default', msg: "Credential Status not found." })
        const vc = localStorage.getItem("3rdPartyAuthVC")
        localStorage.setItem("3rdPartyAuthVCUnregistred", vc)
        return this.$router.push("/account");
      }
      this.$store.dispatch('addHSVerifiableCredential', this.verifiableCredential);
      this.$store.commit('clearHSVerifiableCredentialTemp', []);
      this.accepted = true;


      // here 
      /// decide if the 3rd party auth is enabled or not
      /// if no, then go to /credential page
      /// if yes, the go to /account page
      // if(!localStorage.getItem("3rdPartyAuthVC")){
      //   this.$router.push('/credential');
      // }else{
      //   localStorage.removeItem("3rdPartyAuthVC");
      //   this.$router.push(this.$store.state.loginTargetLocation);
      // }
      this.rejectCredential();


    },
    async rejectCredential() {
      this.$store.commit('clearHSVerifiableCredentialTemp', []);
      // console.log('rejectCredential:: Moving to account page')

      const url = localStorage.getItem("qrDataQueryUrl");
      localStorage.removeItem("qrDataQueryUrl");
      localStorage.removeItem("3rdPartyAuthVC");

      if (url) {
        // console.log('rejectCredential:: url found');        
        // this.$router.push('/account?url=' + url);
        if(this.password){
          const worker=initiateWorker()
          syncSwMixin.methods.syncSW(worker,this.$store);
          this.$router.push('/account?url=' + url);

        }else{
        this.$router.push('/askpinbackup?url='+url)
        }
        // if(isFromThridParty){
        //   console.log('rejectCredential:: isFromThridParty found')
        //   this.$router.push('/account?url=' + url);
        // }else{          
        //   console.log('rejectCredential:: isFromThridParty not found')
        //   this.$router.push("/account");
        // }
      } else {
        // console.log('rejectCredential:: url not found')
        this.$router.push("/account");

        if(this.password){
          const worker=initiateWorker()
          syncSwMixin.methods.syncSW(worker,this.$store);
        }else{
          this.$router.push('/askpinbackup')

        }

      }

      //  backup wallet here


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
  bottom: 15px;
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

// .list-title{
//     color: black;
//     font-weight: bolder;
// }
.list-title {
  color: $text-color;
  font-size: 12px;
  text-transform: capitalize;
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

  p>svg {
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