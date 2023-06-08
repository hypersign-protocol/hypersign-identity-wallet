<template>
  <div class="popup">
    <div class="">
      <div class="cred-card">
        <div class="cred-card-header">
          <span>{{ status }}</span>
        </div>
        <div class="cred-card-body">
          <span class="cred-card-body-detail">DID : {{ did }}</span><br />

        </div>
      </div>
      <div>
        <Button @click="selectDid" data-cy="selectDid" inline dark v-if="hypersign.did !== did">
          Confirm
        </Button>
        <Button @click="register" data-cy="register-on-chain" v-if="status === 'Unregistred'" inline>
          Register
        </Button>
      </div>
      <Loader v-if="loading" />
    </div>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import { HYPERSIGN_AUTH_PROVIDER, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE } from '../../utils/hsConstants'
import hidWalletInstance from '../../utils/hidWallet';

// import HypersignSsiSDK  from 'hs-ssi-sdk'
const HypersignSsiSDK = require('hs-ssi-sdk');
export default {
  components: { QrIcon },
  data() {
    return {

      did: '',
      didDoc: {},
      status: '',
      key: {},
      hdPathIndex: 0,
      loading: false,

    };
  },
  async created() {

    try {
      this.loading = true;

      const DidId = this.$route.params.did;
      if (DidId) {

        this.did = Object.keys(this.hypersign.dids).find(x => x == DidId);
        this.didDoc = this.hypersign.dids[this.did].didDoc;
        this.key = this.hypersign.dids[this.did].keys;
        this.hdPathIndex = this.hypersign.dids[this.did].hdPathIndex;
        this.status = this.toUpper(this.hypersign.dids[this.did].status) === 'PRIVATE' ? 'Unregistred' : 'Registred';
        if (this.toUpper(this.hypersign.dids[this.did].status) === 'PRIVATE') {
          try {
            await this.resolveDid()

          } catch (e) {
            if (e.response.data.code == 3) {
              console.log(e.response.data.message);
            }
          }
        }
      }
      this.loading = false;
    } catch (e) {
      if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });

      this.loading = false;

    }

  },
  computed: {
    ...mapGetters(['hypersign']),
    ...mapState(['mnemonic']),
  },
  methods: {
    async resolveDid(did_id) {
      await hidWalletInstance.generateWallet(this.mnemonic);
      const hsSdk = new HypersignSsiSDK(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
      await hsSdk.init();
      const { didDocument, didDocumentMetadata } = await hsSdk.did.resolve({ did: did_id ? did_id : this.did });
      if (didDocumentMetadata === null) {
        this.status = 'Unregistred'
      } else {
        this.status = 'Registred'
      }
    }
    ,
    async selectDid() {
      try {
        await this.resolveDid(this.didDoc.id)
        this.$store.dispatch('setHSkeys', {
          keys: this.key,
          did: this.didDoc.id,
          didDoc: this.didDoc,
          status: this.status === 'Registred' ? 'public' : 'private',
          hdPathIndex: this.hdPathIndex, // TODO remove hardcoded path index
          selected: true
        });
        this.$store.dispatch('modals/open', { name: 'default', msg: 'DID selected successfully' });

      } catch (e) {
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });

      }

    },
    async register() {
      try {
        await hidWalletInstance.generateWallet(this.mnemonic);
        const balance = await hidWalletInstance.getBalance()
        console.log(balance);
        if (balance < 49999) {
          this.$store.dispatch('modals/open', { name: 'default', msg: 'Insufficient balance. Buy HID and try again' });
          this.loading = false;
          return;
        }
        const register = await this.$store
          .dispatch('modals/open', {
            name: 'confirm',
            title: this.$t('modals.registerDid.title'),
            msg: this.$t('modals.registerDid.msg'),
          }).catch(() => false);
        if (register) {
          this.$emit('closeMenu');
          this.loading = true;
          const hsSdk = new HypersignSsiSDK(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
          await hsSdk.init();
          const verificationMethodId = this.didDoc.id + '#key-1';
          const publicKeyMultibase = this.didDoc.id.split(':').at(-1)
          this.didDoc.verificationMethod[0].publicKeyMultibase = publicKeyMultibase
          const tx = await hsSdk.did.register({
            didDocument: this.didDoc, privateKeyMultibase: this.key.privateKeyMultibase,
            verificationMethodId
          });

          this.status = 'Registred'
          this.selectDid()
        }

        this.loading = false;
      }
      catch (e) {
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
        this.loading = false;

      }
    },

    toUpper(t) {
      if (t)
        return t.toString().toUpperCase();
      else
        return t;
    },
  },
}
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