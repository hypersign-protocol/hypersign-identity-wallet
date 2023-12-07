<template>
  <div class="popup">
    <div class="">
      <!-- <div class="cred-card">
        <div class="cred-card-header">
          <span>{{ credDetials.formattedSchemaName }}</span>
        </div>
        <div class="cred-card-body">
          <span class="cred-card-body-detail">SCHEMA ID: {{ credDetials.schemaId }}</span><br />
          <span class="cred-card-body-detail">ISSUER ID: {{ credDetials.formattedIssuer }}</span><br />
          <span class="cred-card-body-detail">ISSUED ON: {{ credDetials.formattedIssuanceDate }}</span><br />
        </div>
      </div> -->
      <ul class="list-group">
        <li class="list-group-item">
          <div class="list-title">CREDENTIAL ID:</div>
          <div>{{ verifiableCredential.id }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">CREDENTIAL TYPE:</div>
          <div>{{ credDetials.formattedSchemaName }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">SCHEMA ID:</div>
          <div>{{ credDetials.schemaId }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">ISSUER DID:</div>
          <div>{{ verifiableCredential.issuer }}</div>
        </li>
        <li class="list-group-item" style="height: 66px;">
          <div style="float:left; width: 50%">
            <div class="list-title">ISSUANCE DATE:</div>
            <div>{{ formattedDate(verifiableCredential.issuanceDate) }}</div>
          </div>
          <div style="float:right; width: 50%; text-align: right;">
            <div class="list-title">EXPIRY DATE:</div>
            <div>{{ formattedDate(verifiableCredential.expirationDate) }}</div>
          </div>
        </li>

        <li class="list-group-item" v-for="claim in claims" :key="claim">
          <div class="list-title">{{ toUpper(claim) }}:</div>
          <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
        </li>
      </ul>
      <Loader v-if="loading" />
    </div>
    <div>
      <Button v-if="share" v-on:click="shareCredential">Share</Button>
      <Button @click="deleteCredential">
        <CloseIcon width="20" height="20" class="scan-icon" /><span class="scan-text">Delete</span>
      </Button>

      <Loader v-if="loading" />
    </div>
  </div>
</template>
<script>
const HypersignSSISdk = require('hs-ssi-sdk');

import { mapGetters, mapState } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import hidWalletInstance from '../../utils/hidWallet';
import {
  HIDNODE_RPC,
  HIDNODE_REST,
  HIDNODE_NAMESPACE,
  SUPERHERO_HS_AUTH_BASE_URL,
  BUSINESSCARD_SCHEMA,
} from '../../utils/hsConstants';
import Axios from 'axios';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';

export default {
  components: { QrIcon, CloseIcon },
  data() {
    return {
      share: false,
      verifiableCredential: {},
      claims: [],
      loading: false,
      credDetials: {
        formattedIssuer: '',
        formattedExpirationDate: '',
        formattedIssuanceDate: '',
        formattedSchemaName: '',
        schemaId: '',
      },
    };
  },
  created() {
    const credentialId = this.$route.params.credentialId;
    if (credentialId) {
      this.verifiableCredential = this.hypersign.credentials.find(x => x.id == credentialId);
      if (this.verifiableCredential === undefined) {
        return this.$router.push('/account');
      }
      this.credDetials.formattedExpirationDate = toFormattedDate(
        this.verifiableCredential.expirationDate,
      );
      this.credDetials.formattedIssuanceDate = toFormattedDate(
        this.verifiableCredential.issuanceDate,
      );
      this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
      const credentialSchema = this.verifiableCredential.credentialSchema.id;
      if (credentialSchema === BUSINESSCARD_SCHEMA) {
        this.share = true;
      }
      this.credDetials.schemaId = this.verifiableCredential['credentialSchema']['id'].trim();
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }
  },
  computed: {
    ...mapGetters(['hypersign']),
    ...mapState(['mnemonic']),
  },
  methods: {
    formattedDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString();
    },
    deleteCredential() {
      // console.log("deleteCredential");
      try {
        this.loading = true;
        this.$store.dispatch('removeHSVerifiableCredential', this.verifiableCredential);
        this.$store.dispatch('modals/open', {
          name: 'default',
          msg: 'Credential deleted successfully',
        });
        this.$router.push({ name: 'credential' });
        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
    },
    async shareCredential() {
      this.loading = true;

      await hidWalletInstance.generateWallet(this.mnemonic);
      this.hsSDK = new HypersignSSISdk(
        hidWalletInstance.offlineSigner,
        HIDNODE_RPC,
        HIDNODE_REST,
        HIDNODE_NAMESPACE,
      );
      await this.hsSDK.init();

      const vp_unsigned = await this.hsSDK.vp.getPresentation({
        verifiableCredentials: [this.verifiableCredential],
        holderDid: this.hypersign.did,
      });

      const verificationMethodId = this.hypersign.did + '#key-1';
      const vp_signed = await this.hsSDK.vp.signPresentation({
        presentation: vp_unsigned,
        holderDidDocSigned: this.hypersign.didDoc,
        privateKey: this.hypersign.keys.privateKeyMultibase,
        challenge: '123',
        verificationMethodId,
      });

      const result = await Axios({
        method: 'post',
        url: SUPERHERO_HS_AUTH_BASE_URL + 'share',
        data: {
          vp: vp_signed,
        },
      });

      // console.log(result.data.record);
      const id = result.data.record._id;
      this.loading = false;
      return this.$router.push({ name: 'sharedCredential', params: { vp: id } });
    },
    toUpper(t) {
      if (t) return t.toString().toUpperCase();
      else return t;
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
