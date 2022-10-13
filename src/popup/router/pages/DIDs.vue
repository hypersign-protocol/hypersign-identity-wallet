<template>
  <div class="popup">
    <!-- <button data-cy="copy" @click="copy">
        + Create
      </button> -->
    <!-- <button class="back-button" @click="$router.push(to)">
        <ae-icon name="left-more" class="back-icon" /> Create
      </button> -->
    <span class="altText" v-if="Object.keys(hypersign.dids).length == 0">No credential found. Scan QR to get
      credentials.</span>
    <Panel v-else>
      <PanelItem v-for="did in Object.keys(hypersign.dids)" :key="hypersign.dids[did].didDoc.id"
        :to="`/did/${hypersign.dids[did].didDoc.id}`"
        :title="`ID: ${hypersign.dids[did].didDoc.id.substring(0, 25)}...`"
        :info="`Type: ${hypersign.dids[did].status}`" />

    </Panel>
    <Button @click="generateNewDid" data-cy="generate-new-did">
      Create Another
    </Button>
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
import { toFormattedDate, toStringShorner } from '../../utils/helper'
import hidWalletInstance from '../../utils/hidWallet';
import { generateMnemonicToHDSeed } from '../../utils/SSIWallet';
import { HYPERSIGN_AUTH_PROVIDER, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE } from '../../utils/hsConstants'

// import HypersignSsiSDK  from 'hs-ssi-sdk'
const HypersignSsiSDK = require('hs-ssi-sdk');

export default {
  mixins: [removeAccountMixin],
  components: { CheckBox, Panel, Button, PanelItem, QrIcon, Textarea },
  data() {
    return {
      loading: false,
    };
  },
  props: ['address'],
  computed: {
    ...mapState(['saveErrorLog']),
    ...mapGetters(['hypersign']),
    ...mapState(['mnemonic']),
    validUrl() {
      return this.form.url != '';
    },
  },
  created() {
    //Only for deeplinking
    if (this.$route.query.url && this.$route.query.url != '')
      this.deeplink(this.$route.query.url)
  },

  methods: {

    async generateNewDid() {
      try {
        this.loading = true;
        const hdIndex=Object.keys(this.hypersign.dids).length
        
        await hidWalletInstance.generateWallet(this.mnemonic);
        const hsSdk = new HypersignSsiSDK(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
        await hsSdk.init();
        const seedHd = await generateMnemonicToHDSeed(this.mnemonic,hdIndex);
        const kp = await hsSdk.did.generateKeys({ seed: seedHd });
        const privateKeyMultibase = kp.privateKeyMultibase
        const publicKeyMultibase = kp.publicKeyMultibase

        const didDoc = await hsSdk.did.generate({ publicKeyMultibase });
        this.$store.commit('setHSkeys', {
          keys: kp,
          did: didDoc.id,
          didDoc,
          status: "private",
          hdPathIndex: hdIndex, // TODO remove hardcoded path index
          selected: false // true/false
        });
        this.loading = false;

      } catch (e) {
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
        this.loading = false;

      }

    },
    toFormattedDate(dateStr) {
      const d = new Date(dateStr);
      return d.toDateString();
    },


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
