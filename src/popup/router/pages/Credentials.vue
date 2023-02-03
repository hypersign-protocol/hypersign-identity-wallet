<template>

    <div class="popup">
      <Button   data-cy="generate-new-did" :to="`/credential/issue/`"  style="display: flex;justify-content: center;width: 14%;padding: 6px;margin-right: 1%;">
      <CreateIcon ></CreateIcon>
    </Button>
      <span class="altText" v-if="hypersign.credentials.length == 0">No credential found. Scan QR to get credentials.</span>
      <div v-else style="max-height: 600px; overflow-y: scroll">
        <div class="cred-card" v-for="credential in hypersign.credentials" :key="credential.id"  @click="moveTo(`/credential/${credential.id}`)">
          <div class="cred-card-header">
            <div style="float: left">
              <div class="whiteFont" style="font-size:large; font-weight: bold;">{{ shortner(credential.type[1],19, 10) }}</div>
              <div class="fieldName">{{ schemaIdFormatted(credential['@context'][1].hs).toUpperCase() }}</div>
            </div>
            <div class="bg-img-hs"></div>
          </div>
          <div class="cred-card-body container">
            
            <div style="width: 100%; padding: 5px;   height: 3vh;margin-top: 14px;color: #CCCCCC; font-weight: bold;   font-size: 14px">
              {{ shortner(credential.id.toUpperCase(), 28, 6) }}
            </div>

            
            <div style="display: table;   width: 100%;">
              
                <div style="float: left;   width: 45%; padding: 5px;">
                  <div class="fieldName">Issuer</div>
                  <div class="whiteFont"> {{  shortner(credential.issuer, 15, 5).toUpperCase()  }}</div>
                </div>
              
              <div style="float: left; width: 27%; padding: 5px;">

                  <div class="fieldName">Issued At</div>
                  <div class="whiteFont"> {{  formattedDate(credential.issuanceDate) }}</div>
        
              </div>
              <div style="float: left; width: 28%; padding: 5px; text-align: right;">
                  <div class="fieldName">Valid Till</div>                    
                  <div class="whiteFont">{{  formattedDate(credential.expirationDate) }}</div>
              </div>

              
            </div>
            <!-- <div class="cred-card-body-detail"> {{ credential.id.toUpperCase() }}</div> -->
          </div>
        </div>
      </div>
      
      
      <!-- <Panel>
        
        <PanelItem
          v-for="credential in hypersign.credentials"
          :key="credential.id"
          :to="`/credential/${credential.id}`"
          :title="credential.type[1]"
          :info="toFormattedDate(credential.issuanceDate)"
        />
      </Panel> -->
      <Loader v-if="loading" />
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import removeAccountMixin from '../../../mixins/removeAccount';
import CheckBox from '../components/CheckBox';
import Panel from '../components/Panel';
import PanelItem from '../components/PanelItem';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import axios from 'axios';
import { HS_VC_STATUS_PATH } from '../../utils/hsConstants'
import CreateIcon from '../../../icons/topup-icon.svg?vue-component';
import {toFormattedDate, toStringShorner} from '../../utils/helper'
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
export default {
  mixins: [removeAccountMixin],
  components: { CheckBox, Panel,Button, PanelItem, QrIcon, Textarea ,CreateIcon},
  data() {
    return {
      form: {
        url: '',
        amount: '',
      },
      loading: false,
      credentialDetail: {
        formattedSchemaName: "",
        formattedIssuanceDate: "",
      }
    };
  },
  props: ['address'],
  computed: {
    ...mapState(['saveErrorLog']),
    ...mapGetters(['hypersign']),
    validUrl() {
      return this.form.url != '';
    },
    
  },
  async created() {
    //Only for deeplinking
    if (localStorage.getItem("3rdPartyAuthVCUnregistred")) {
      this.verifiableCredential = JSON.parse(localStorage.getItem("3rdPartyAuthVCUnregistred"));
      localStorage.removeItem("3rdPartyAuthVCUnregistred");
      // localStorage.setItem("3rdPartyAuthVC", JSON.stringify(this.verifiableCredential));
      try {
        this.loading = true;
        this.credStatus = await axios.get(`${HS_VC_STATUS_PATH}/${this.verifiableCredential.id}`);
        this.loading = false;
        if (this.credStatus.data.vc.credStatus.claim.currentStatus == "Live") {
          // console.log("inside if");
          this.$store.dispatch('addHSVerifiableCredentialTemp', this.verifiableCredential);
          this.$router.push(`/credential/temp/${this.verifiableCredential.id}`);
        }
        return
      } catch (error) {
        this.loading = false;
        localStorage.setItem("3rdPartyAuthVCUnregistred", JSON.stringify(this.verifiableCredential));
        localStorage.removeItem("3rdPartyAuthVC");
        return
      }

      
    }
    if (this.$route.query.url && this.$route.query.url != '')
      this.deeplink(this.$route.query.url)
  },

  methods: {
    shortner(str, max, len){
      if(str && str.length > max){
        return toStringShorner(str, max, len)
      }else {
        return str
      }
    },
    schemaIdFormatted(credentialSchemaUrl){
      if(credentialSchemaUrl){
        return toStringShorner(getSchemaIdFromSchemaUrl(credentialSchemaUrl).trim(), 24, 4)
      }  else {
        return ""
      }
    },
    moveTo(path){
      this.$router.push(path);
    },
    // formattedExpiryDate(expDate, issDate = ''){
    //   const date1 = new Date(expDate);
    //   if(issDate){
    //     const date2 = new Date(issDate);
    //     const diffTime = Math.abs(date2 - date1);
    //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    //     return diffDays
    //   } else {
    //      return date1.toLocaleDateString()
    //   }
    // },
    formattedDate(date){
      const d =  new Date(date)      
      return d.toLocaleDateString() //`${month}/${day}/${year}`
    },
    toFormattedDate(dateStr) {
      const d = new Date(dateStr);
      return d.toDateString();
    },
    async scan() {
      try {
        //console.log('scanning...')
        this.form.url = await this.$store.dispatch('modals/open', {
          name: 'read-qr-code',
          title: this.$t('pages.credential.scanCredential'),
        });
        await this.fetchCredential();
      } catch (e) {
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async fetchCredential() {
      this.form.url = this.form.url + '&did=' + this.hypersign.did;
      this.loading = true;
      let response = await axios.get(this.form.url);
      if(response){
        response = response.data;
        if (!response) throw new Error('Can not accept credential');
        if (response && response.status != 200) throw new Error(response.error);
        if (!response.message) throw new Error('Can not accept credential');
        await this.acceptCredential(response.message)
        this.loading = false;
      }
    },

    async deeplink(url) {
      try {
        //console.log('deeplink...')
        this.form.url = url;
        await this.fetchCredential();
      } catch (e) {
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async acceptCredential(credential) {
      //console.log('acceptCredential...')
      if (this.hypersign.did != credential.credentialSubject.id) throw new Error('This credential is not being issued to you');
      const confirmed = await this.$store.dispatch('modals/open', {
        name: 'confirm',
        title: 'Credential Acceptance',
        msg: `You are receiving credential: '${credential.type[1]}' \
                    from an issuer: '${credential.issuer}'. \
                    Do you want to accept?`,
      })
        .catch(() => false);
      if (confirmed) {
        credential.expirationDate = toFormattedDate(credential.expirationDate);
        credential.issuanceDate = toFormattedDate(credential.issuanceDate);
        credential.formattedIssuer = toStringShorner(credential.issuer, 32, 15);
        credential.formattedSchemaName = toStringShorner(credential.type[1], 26, 15);
        this.$store.dispatch('addHSVerifiableCredential', credential);
      }
    }

  },
};
</script>


<style lang="scss" scoped>
@import '../../../common/variables';
.bg-img-hs{
  float: right;
               height: 83px;
               width: 66px; 
               background-repeat: no-repeat;
               opacity: 0.2;
               background-size: 187px;
               background-image: url('https://static.tildacdn.com/tild6465-3733-4035-b237-306265336431/Group_462.svg');
}
 
.fieldName{
  font-size: xx-small;
  color: grey;
}
.cred-card-body {
  // height: 14vh;
  // padding: 10px;
  height: 8vh;
}

.whiteFont{
  color: white;
  font-size: smaller;
}
.cred-card {
  // background: #1B1927 !important;
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.2);
  font-family: 'IBM Plex Sans',Arial,sans-serif;
  padding: 16px;
  background: -webkit-linear-gradient(140deg, #8653a4, #1b1927);
  border-radius: 14px;
  margin-top: 7%;
  text-align: left;
  font-size: 13px;
  color: gray;
}

.cred-card-header {
  color: #fff;
  height:10vh;  
  padding: 5px;
}


.altText {
  color: #80808091;
  font-size: larger;
}

.d-flex {
  display: flex;
  float: right;
  padding: 5px;
}

.scan-text {
  margin-left: 20px;
  margin-bottom: 2px;
  // float: right;
}

.scanner {
  // position: fixed;
  bottom: 0;
  margin-top: 3%;
  width: 59%;
  border-radius: 49px;
  margin-left: 13%;
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
