<template>
  <div class="popup">
    <div class="">
      <div class="cred-card">
        <div class="cred-card-header">
          <span>{{ credDetials.formattedSchemaName }}</span>
        </div>
        <div class="cred-card-body">
          <span class="cred-card-body-detail">SCHEMA ID: {{ credDetials.schemaId }}</span
          ><br />
          <span class="cred-card-body-detail">ISSUER ID: {{ credDetials.formattedIssuer }}</span
          ><br />
          <span class="cred-card-body-detail"
            >ISSUED ON: {{ credDetials.formattedIssuanceDate }}</span
          ><br />
        </div>
      </div>
      <br />

      <div v-if="qrdata != ''">
        <div class="copied-alert" v-if="copied">{{ $t('pages.account.copied') }}</div>

        <code class="copyicon" @click="copy">{{ short_link }}</code>
        <img src="../../../icons/copy.svg" class="copyicon" slot="icon" @click="copy"></CopyIcon>
        <div if="showQr">
          <VueQr
            v-if="qrdata != ''"
            :text="qrdata"
            :size="250"
            :logoSrc="logo"
            logoBackgroundColor="white"
          >
          </VueQr>
        </div>
        <!-- <Button @click="verify()" >Verify</Button> -->
        <Button @click="saveAs()">Save Contact</Button>
      </div>
      <ul class="list-group">
        <li class="list-group-item" v-for="claim in claims" :key="claim">
          <div class="list-title">{{ toUpper(claim) }}:</div>
          <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
        </li>
      </ul>
      <Loader v-if="loading" />
    </div>
  </div>
</template>
<script>
// const HypersignSSISdk = require('hs-ssi-sdk');
import vCardsJS from 'vcards-js';

import VueQr from 'vue-qr';
import Axios from 'axios';

import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { WALLET_URL, SUPERHERO_HS_AUTH_BASE_URL } from '../../utils/hsConstants';

export default {
  components: { VueQr },
  data() {
    return {
      verifiableCredential: {},
      copied: false,
      claims: [],
      loading: false,
      qrdata: '',
      link: '',
      short_link: '',
      logo: require('../../../icons/hypersign-icon.png'),
      showQr: false,
      vp: {},
      sortUrl: '',
      vcf: {},
      credDetials: {
        formattedIssuer: '',
        formattedExpirationDate: '',
        formattedIssuanceDate: '',
        formattedSchemaName: '',
        schemaId: '',
      },
    };
  },
  async created() {
    try {
      this.loading = true;
      this.vp = this.$route.params.vp;

      const fetcedVp = await Axios.get(`${SUPERHERO_HS_AUTH_BASE_URL}shared/vp/${this.vp}`);
      this.vp = fetcedVp.data.vp;
      this.sortUrl = fetcedVp.data._id;
    } catch (error) {
      this.vp = JSON.parse(Buffer.from(this.$route.params.vp, 'base64').toString('utf8'));
    }

    //   console.log("credentialId", credentialId);

    if (this.vp) {
      this.verifiableCredential = this.vp.verifiableCredential[0];
      this.credDetials.formattedExpirationDate = toFormattedDate(
        this.verifiableCredential.expirationDate,
      );
      this.credDetials.formattedIssuanceDate = toFormattedDate(
        this.verifiableCredential.issuanceDate,
      );
      this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; // toStringShorner(this.verifiableCredential.type[1], 26, 15);
      const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
      this.credDetials.schemaId = toStringShorner(
        this.verifiableCredential.credentialSchema.id,
        32,
        15,
      );
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }
    const credSub = this.vp.verifiableCredential[0].credentialSubject;
    // console.log("credSub", credSub);
    const arr = Object.keys(credSub).map(key => [key, credSub[key]]);
    const vcard = vCardsJS();
    arr.forEach(element => {
      switch (element[0]) {
        case 'facebook':
          vcard.socialUrls.facebook = element[1];
          break;
        case 'twitter':
          vcard.socialUrls.twitter = element[1];
          break;
        case 'linkedIn':
          vcard.socialUrls.linkedIn = element[1];
          break;
        case 'telegram':
          vcard.socialUrls.telegram = element[1];
          break;
        case 'discord':
          vcard.socialUrls.discord = element[1];
          break;
        case 'workAddresslabel':
          vcard.workAddress.label = element[1];
          break;
        case 'workAddressstreet':
          vcard.workAddress.street = element[1];
          break;
        case 'workAddresscity':
          vcard.workAddress.city = element[1];
          break;
        case 'workAddressstateProvince':
          vcard.workAddress.stateProvince = element[1];
          break;
        case 'workAddresspostalCode':
          vcard.workAddress.postalCode = element[1];
          break;
        case 'workAddresscountryRegion':
          vcard.workAddress.countryRegion = element[1];
          break;
        case 'logo':
          vcard.logo.attachFromUrl(element[1], 'JPEG');
          break;
        case 'photo':
          vcard.photo.attachFromUrl(element[1], 'JPEG');
          break;
        default:
          vcard[element[0]] = element[1];
          break;
      }
    });

    this.vcf = vcard.getFormattedString(); // console.log("vcf", this.vcf);
    this.loading = false;

    this.link = `${WALLET_URL}businesscard/${this.sortUrl}`;
    this.qrdata = this.vcf;
    // console.log(this.vcf);
    this.showQr = true;

    this.short_link = toStringShorner(this.link, 32, 15);
  },

  methods: {
    iOS() {
      return (
        ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
          navigator.platform,
        ) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document && !window.MSStream)
      );
    },
    saveAs() {
      let blob = '';
      if (this.iOS() === true) {
        blob = new Blob([this.vcf], { type: 'text/vcard;charset=utf-8' });
        //  console.log("iOS:: Detected");
      } else {
        blob = new Blob([this.vcf], { type: 'text/plain;charset=utf-8' });
        // console.log("Not IOS");
      }
      const link = document.createElement('a');
      link.href = window.webkitURL.createObjectURL(blob);
      link.download = 'contact.vcf';
      link.click();
      link.remove();
    },
    copy() {
      navigator.clipboard.writeText(this.link);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    },

    toUpper(t) {
      if (t) return t.toString().toUpperCase();
      return t;
    },
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

.scan-text {
  margin-left: 20px;
  margin-bottom: 2px;
  // float: right;
}

.copyicon,
.copied-alert {
  color: #21222a;
}

.scanner {
  // position: fixed;
  bottom: 0;
  margin-top: 3%;
  width: 59%;
  border-radius: 49px;
  margin-left: 13%;
}

.credential-list {
  min-height: 700px;
  overflow-y: auto;
  border-radius: 5px;
  overflow-x: hidden;
  max-height: 700px;
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
