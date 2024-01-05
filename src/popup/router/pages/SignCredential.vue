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
          <textarea>{{ JSON.stringify(this.credentialRaw, null, 2) }}</textarea>
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
      credentialRaw: '',
    };
  },
  async created() {
    // get the schemadata to sign from route
    /*
{
  "QRType": "ISSUE_CREAD",
  "serviceEndpoint": "https://stage.hypermine.in/studioserver/api/v1/credential/status/63076332a6812f5ce9209095",
  "schemaId": "",
  "appDid": "",
  "appName": "Hypersign Studio",
  "challenge": "",
  "provider": "",
  "data": {
    "fields": {
      "Name": "Pratap Mridha",
      "Email": "pratapmridha@gmail.com",
      "Phone No": "8293775017"
    },
    "schemaId": "did:hs:zBrKp2nQvmYLqiMtqy1Guc7PEsqGDiMRPZVEw2ocTS7Us;id=fedaeb1b-45f3-4bde-b57b-e484d8d93d5e;version=1.0",
    "issuerDid": "did:hs:zBrKp2nQvmYLqiMtqy1Guc7PEsqGDiMRPZVEw2ocTS7Us",
    "subjectDid": "did:hs:z7N1g3x7vHkwXPH8DjPoNyyQoxndhqXLjpwqARmQz9iW5"
  }
}
*/
    this.credentialRaw = this.hypersign.requestingAppInfo.data;
    await hidWalletInstance.generateWallet(this.mnemonic);
    this.hsSDK = new HypersignSSISdk(
      hidWalletInstance.offlineSigner,
      HIDNODE_RPC,
      HIDNODE_REST,
      HIDNODE_NAMESPACE,
    );
    await this.hsSDK.init();
    // await this.signAndSendToBlockchain();
  },
  methods: {
    async reject() {
      this.$store.commit('clearRequestingAppInfo');
      this.$router.push('/account');
    },
    async prepareCredential() {
      // using hs-ssi-sdk to g
      const schemaOptions = this.credentialRaw;
      const { fields, subjectDid, schemaId, expirationDate, issuerDid } = this.credentialRaw;
      // console.log("Credential to sign",  this.credentialRaw);
      if (!fields) {
        throw new Error('field is missing');
      }

      if (!subjectDid) {
        throw new Error('subject did is missing');
      }

      if (!schemaId) {
        throw new Error('schemaId is missing');
      }

      if (!expirationDate) {
        throw new Error('expirationDate is missing');
      }

      return await this.hsSDK.vc.getCredential({
        schemaId,
        // subjectDidDocSigned:this.hypersign.didDoc ,
        subjectDid,
        issuerDid,
        expirationDate,
        fields,
      });
    },
    async checkCredentialStatus(url) {
      return await axios.get(url);
    },
    async updateCredentialStatus() {
      try {
        /**
                 * {
                        "QRType":"ISSUE_CREDENTIAL",
                        "serviceEndpoint":"https://stage.hypermine.in/studioserver/api/v1/credential/status/63565236c1d75e9aa41f7e59",
                        "schemaId":"",
                        "appDid":"",
                        "appName":"Hypersign Studio",
                        "challenge":"",
                        "provider":"",
                        "data":{
                            "fields":{
                                "tedst":"DOWN"
                            },
                            "schemaId":"sch:hid:testnet:zCdhEJ4bspo4DzzA9jm7bCVigQkKi2HFJ6C2VPsQqjvuE:1.0",
                            "issuerDid":"did:hid:testnet:zCSBdntYoBUBkoJDwPzve2s6RjURZNNntJL4u7THtv6u9",
                            "subjectDid":"did:hid:testnet:z4SozwovkEeQcxGbZhYmYydVTDHgodJKD7X2n7k3rVM3J",
                            "expiryDate":"2022-10-26 11:28:00",
                            "orgDid":"63494e0ba0195d49920b22bd",
                            "expirationDate":"2022-10-26T11:28:00.000Z",
                            "status": 'SUSPENDED',
                            "vcId":'vc:test:.............'
                            "credentialStatusUrl":'',
    
                        }
                        }
                */
        if (!this.credentialRaw.vcId) {
          throw new Error('vcId is missing while updating credential status');
        }
        if (!this.credentialRaw.credentialStatusUrl) {
          throw new Error('credentialStatusUrl is missing while updating credential status');
        }
        const orgDid = await this.hsSDK.did.resolve({ did: this.credentialRaw.issuerDid });
        if (orgDid.didDocument.controller.includes(this.credentialRaw.orgDid)) {
          throw new Error('You are not the issuer of this credential');
        }
        let credential;

        if (
          this.credentialRaw.status === 'REVOKED' ||
          this.credentialRaw.status === 'SUSPENDED' ||
          this.credentialRaw.status === 'LIVE'
        ) {
          credential = await this.checkCredentialStatus(this.credentialRaw.credentialStatusUrl);
          credential = credential.data;
          const status = credential.credStatus.claim.currentStatus.toUpperCase();
          // console.log('status',status);
          if (status === 'REVOKED' || status === 'EXPIRED') {
            throw new Error(`Credential is already ${status.toLowerCase()}`);
          }
          if (status === 'SUSPENDED' && this.credentialRaw.status === 'SUSPENDED') {
            throw new Error(`Credential is already ${status.toLowerCase()}`);
          }

          if (status === 'LIVE' && this.credentialRaw.status === 'LIVE') {
            throw new Error(`Credential is already ${status.toLowerCase()}`);
          }
          // if vc is not found then throw error
          if (!credential || credential === undefined) {
            throw new Error('credential not found in the revocation registry');
          } else {
            const privateKey = this.hypersign.keys.privateKeyMultibase;
            const issuerDid = this.hypersign.did;
            const verificationMethodId = this.hypersign.didDoc.verificationMethod[0].id;
            // update the credential status
            const result = await this.hsSDK.vc.updateCredentialStatus({
              credStatus: credential.credStatus,
              privateKey,
              issuerDid,
              verificationMethodId,
              status: this.credentialRaw.status,
              statusReason: this.credentialRaw.statusReason,
            });

            if (result) {
              this.$store.dispatch('modals/open', {
                name: 'default',
                msg: 'Successfully Updated Credential',
              });
              const { serviceEndpoint } = this.hypersign.requestingAppInfo;
              if (serviceEndpoint) {
                try {
                  const credentialStatus = await this.checkCredentialStatus(
                    this.credentialRaw.credentialStatusUrl,
                  );
                  const body = {
                    transactionHash: result.transactionHash,
                    credStatus: credentialStatus.data.credStatus,
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
          }
        } else {
          throw new Error('Invalid status');
        }
      } catch (e) {
        // console.log(e)
        this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
    },

    async signAndSendToBlockchain() {
      try {
        this.loading = true;
        // chcek is status is passed here   in Credential Raw
        if (this.credentialRaw.status) {
          // update the status of the credential
          await this.updateCredentialStatus();
          return;
        }
        const vc = await this.prepareCredential();
        const result = await this.hsSDK.vc.issueCredential({
          credential: vc,
          issuerDid: this.hypersign.did,
          privateKey: this.hypersign.keys.privateKeyMultibase,
          verificationMethodId: `${this.hypersign.didDoc.id}#key-1`,
        });

        if (result) {
          this.$store.dispatch('modals/open', {
            name: 'default',
            msg: 'Successfully Issued Credential',
          });
          // / call the sutatus API of the studio/dappp server to for updating the status in db.
          const { serviceEndpoint } = this.hypersign.requestingAppInfo;
          if (serviceEndpoint) {
            try {
              const body = {
                transactionHash: result.transactionHash,
                vc,
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
