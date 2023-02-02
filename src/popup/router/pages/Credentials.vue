<template>

    <div class="popup">
      <Button   data-cy="generate-new-did" :to="`/credential/issue/`"  style="display: flex;justify-content: center;width: 14%;padding: 6px;margin-right: 1%;">
      <CreateIcon ></CreateIcon>
    </Button>
      <span class="altText" v-if="hypersign.credentials.length == 0">No credential found. Scan QR to get credentials.</span>
      <Panel v-else>
        
        <PanelItem
          v-for="credential in hypersign.credentials"
          :key="credential.id"
          :to="`/credential/${credential.id}`"
          :title="credential.type[1]"
          :info="toFormattedDate(credential.issuanceDate)"
        />
      </Panel>
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
      //console.log('fetchCredential...')
      this.form.url = this.form.url + '&did=' + this.hypersign.did;
      this.loading = true;
      let response = await axios.get(this.form.url);
      response = response.data;
      if (!response) throw new Error('Can not accept credential');
      if (response && response.status != 200) throw new Error(response.error);
      if (!response.message) throw new Error('Can not accept credential');
      await this.acceptCredential(response.message)
      this.loading = false;
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
