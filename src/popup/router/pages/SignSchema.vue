<template>
  <div class="popup">
    <div>
      <div class="">
        <div class="appInfo">
          <p>
            This organisation
            <span style="font-style:oblique">{{ hypersign.requestingAppInfo.appName }}</span> is
            requesting to sign the following
          </p>
          <textarea>{{ JSON.stringify(this.schemaRaw, null, 2) }}</textarea>
        </div>
      </div>
      <div class="scanner d-flex">
        <Button class="scan" data-cy="scan-button" @click="signAndSendToBlockchain()">
          <img
            src="../../../icons/badges/verified.svg"
            width="20"
            height="20"
            class="scan-icon"
          /><span class="scan-text">{{ $t('pages.credential.authorize') }}</span>
        </Button>
      </div>
      <div class="scanner d-flex">
        <Button class="scan" data-cy="scan-button" @click="reject()">
          <img
            src="../../../icons/badges/not-verified.svg"
            width="20"
            height="20"
            class="scan-icon"
          /><span class="scan-text">{{ $t('pages.credential.decline') }}</span>
        </Button>
      </div>
    </div>
    <Loader v-if="loading" />
  </div>
</template>
<style>
textarea {
  overflow-y: scroll;
  height: 40vh;
  width: 100%;
  resize: none;
}
</style>

<script>
import { mapGetters, mapState } from 'vuex';
import { HypersignSSISdk } from 'hs-ssi-sdk';
import axios from 'axios';
import hidWalletInstance from '../../utils/hidWallet';
// const HypersignSSISdk = require('hs-ssi-sdk');
import { HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE } from '../../utils/hsConstants';

export default {
  name: 'IssueSchema',
  computed: {
    ...mapGetters(['hypersign']),
    ...mapState(['mnemonic']),
  },
  components: {},
  beforeDestroy() {
    this.reject();
  },
  data() {
    return {
      hsSDK: null,
      loading: false,
      schemaRaw: '',
    };
  },
  async created() {
    // get the schemadata to sign from route
    this.schemaRaw = this.hypersign.requestingAppInfo.data;
    // console.log(JSON.stringify(this.schemaRaw))
    await hidWalletInstance.generateWallet(this.mnemonic);
    this.hsSDK = new HypersignSSISdk({
      offlineSigner: hidWalletInstance.offlineSigner,
      nodeRpcEndpoint: HIDNODE_RPC,
      nodeRestEndpoint: HIDNODE_REST,
      namespace: HIDNODE_NAMESPACE,
    });
    await this.hsSDK.init();
    // await this.signAndSendToBlockchain();
  },
  methods: {
    async reject() {
      this.$store.commit('clearRequestingAppInfo');
      this.$router.push('/account');
    },
    async prepareSchema() {
      // using hs-ssi-sdk to g
      const schemaOptions = this.schemaRaw; // JSON.parse(this.schemaRaw)
      return await this.hsSDK.schema.generate({
        name: schemaOptions.name,
        description: schemaOptions.description,
        author: schemaOptions.author, //orgDid
        additionalProperties: schemaOptions.additionalProperties,
        fields: schemaOptions.fields,
      });
    },
    async signAndSendToBlockchain() {
      try {
        this.loading = true;
        const schemaToSign = await this.prepareSchema();
        // console.log(schemaToSign);
        const signature = await this.hsSDK.schema.sign({
          privateKeyMultibase: this.hypersign.keys.privateKeyMultibase,
          schema: schemaToSign,
          verificationMethodId:this.hypersign.didDoc.verificationMethod[0].id
        });
        const { assertionMethod } = this.hypersign.didDoc;
        // TODO: This should go into hs-ssi-sdk
        console.log(signature, assertionMethod);
        let proof = {
          type: 'Ed25519Signature2020',
          created: schemaToSign.authored,
          verificationMethod: assertionMethod[0],
          proofValue: signature,
          proofPurpose: 'assertion',
        };

        const result = await this.hsSDK.schema.register({ schema: signature });
        if (result) {
          this.$store.dispatch('modals/open', { name: 'default', msg: result.transactionHash });
          /// call the sutatus API of the studio/dappp server to for updating the status in db.
          const { serviceEndpoint } = this.hypersign.requestingAppInfo;
          if (serviceEndpoint) {
            try {
              const body = {
                transactionHash: result.transactionHash,
                schemaId: schemaToSign.id,
                author: this.hypersign.did,
              };
              axios
                .post(serviceEndpoint, body)
                .then(response => {
                  if (response && response.status === 200) {
                    console.log('Successfully sent result to serviceEndpoint');
                  } else {
                    console.log('Could not sent result to serviceEndpoint');
                  }
                })
                .catch(e => {
                  console.error(e);
                });
            } catch (e) {
              console.error(e);
              this.loading = false;
            }
          } else {
            console.log('No serviceEndpoint available.');
          }
        }
      } catch (e) {
        // console.log(e)
        this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      } finally {
        this.loading = false;
        this.reject();
      }
    },
  },
};
</script>
